import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { prTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

export const aggregate = async (
  repositories: { id: number; name: string }[],
) => {
  const octokit = await getOctokit();
  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  await PromisePool.for(repositories.slice(0, 5))
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository) => {
      // eg: "2024-12-01";
      const now = new Date();
      const createdAfter = `${now.getFullYear()}-${
        now.getMonth() // 1 month ago
      }-${now.getDate().toString().padStart(2, "0")}`;

      // ref: https://docs.github.com/ja/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests
      const prs = await octokit.paginate(octokit.rest.pulls.list, {
        owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
        repo: repository.name,
        per_page: 100,
        sort: "created",
        created: `:>=${createdAfter}`,
      });

      await PromisePool.for(prs)
        // parent: 8 , child: 10 = max 80 concurrent requests
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(10)
        .process(async (pr) => {
          const authorId = pr.user?.id;
          if (!authorId) return;

          await sharedDbClient
            .insert(prTbl)
            .values({
              id: pr.id,
              title: pr.title,
              number: pr.number,
              state: pr.state,
              merged_at: pr.merged_at ? new Date(pr.merged_at) : null,
              createdAt: new Date(pr.created_at),
              updatedAt: new Date(pr.updated_at),
              authorId: authorId,
              repositoryId: repository.id,
            })
            .onConflictDoUpdate({
              target: prTbl.id,
              set: {
                title: pr.title,
                number: pr.number,
                state: pr.state,
                merged_at: pr.merged_at ? new Date(pr.merged_at) : null,
                updatedAt: new Date(pr.updated_at),
                authorId: authorId,
              },
            });
        });
    });

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data.rate, null, 2));
};
