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

      const login = user.data.login;
      const avatar_url = user.data.avatar_url;
      const updated_at = user.data.updated_at;

      console.log(
        `login: ${login}, avatar_url: ${avatar_url}, updated_at: ${updated_at}`,
      );

      if (!login || !avatar_url || !updated_at) return;

      await sharedDbClient
        .insert(userTbl)
        .values({
          id: userId,
          login: login,
          avatarUrl: avatar_url,
          updatedAt: new Date(updated_at),
        })
        .onConflictDoUpdate({
          target: userTbl.id,
          set: {
            login: login,
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
