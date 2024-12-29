import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { prTbl, releaseTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { desc, notInArray } from "drizzle-orm";

export const aggregate = async (
  repositories: { id: number; name: string }[],
) => {
  const octokit = await getOctokit();
  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  await PromisePool.for(repositories)
    // 8 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository, i) => {
      logger.info(
        `Start aggregate:pr ${repository.name} (${i + 1}/${repositories.length})`,
      );

      // ref: https://docs.github.com/ja/rest/pulls/pulls?apiVersion=2022-11-28#list-pull-requests
      // const prs = await octokit.paginate(octokit.rest.pulls.listReviewCommentsForRepo, {
      const prs = await octokit.paginate(
        octokit.rest.pulls.list,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 100,
          state: "all",
          sort: "created",
          direction: "desc",
        },
        (response, done) => {
          if (
            response.data.find(
              (pr) =>
                new Date(pr.created_at).getTime() <
                new Date(
                  Date.now() - 6 /* month */ * 60 * 60 * 24 * 30 * 1000,
                ).getTime(),
            )
          ) {
            done();
          }
          return response.data;
        },
      );

      await PromisePool.for(prs)
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(1)
        .process(async (pr) => {
          const authorId = pr.user?.id;
          if (!authorId) return;

          await sharedDbClient
            .insert(prTbl)
            .values({
              id: pr.id,
              title: pr.title,
              number: pr.number,
              mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
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
                mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                updatedAt: new Date(pr.updated_at),
                authorId: authorId,
              },
            });
        });
    });

  const latestPrs = await sharedDbClient
    .select()
    .from(prTbl)
    .orderBy(desc(prTbl.mergedAt))
    .limit(100);

  await sharedDbClient
    .update(prTbl)
    .set({
      // DB Sizeを減らすためにTextをnullにする
      title: null,
    })
    .where(
      notInArray(
        releaseTbl.id,
        latestPrs.map((pr) => pr.id),
      ),
    );
};
