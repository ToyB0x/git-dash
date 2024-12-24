import { getOctokit, sharedDbClient } from "@/clients";
import { logger } from "@/utils";
import { prTbl, userTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

export const aggregate = async () => {
  const octokit = await getOctokit();
  const prs = await sharedDbClient
    .selectDistinct({ authorId: prTbl.authorId })
    .from(prTbl);

  // TODO: reviewerのIdも取得する
  const userIds = prs.map((pr) => pr.authorId);

  const { errors } = await PromisePool.for(userIds)
    // 8 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (userId, i) => {
      logger.info(
        `Start aggregate:user ${userId} (${i + 1}/${userIds.length})`,
      );

      // ref: https://docs.github.com/ja/rest/users/users?apiVersion=2022-11-28#get-a-user-using-their-id
      const user = await octokit.request("GET /user/{account_id}", {
        account_id: userId,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      const login = user.data.login as string;
      const avatar_url = user.data.avatar_url as string;
      const name = user.data.name as string | null;
      const blog = user.data.blog as string | null;
      const updated_at = user.data.updated_at as string;

      if (!login || !avatar_url || !updated_at) return;

      await sharedDbClient
        .insert(userTbl)
        .values({
          id: userId,
          login: login,
          name: name,
          blog: blog,
          avatarUrl: avatar_url,
          updatedAt: new Date(updated_at),
        })
        .onConflictDoUpdate({
          target: userTbl.id,
          set: {
            login: login,
            name: name,
            blog: blog,
            avatarUrl: avatar_url,
            updatedAt: new Date(updated_at),
          },
        });
    });

  if (errors.length) {
    logger.error(errors.length);
  }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data.rate, null, 2));
};
