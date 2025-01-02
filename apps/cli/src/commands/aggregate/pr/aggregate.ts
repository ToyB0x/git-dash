import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { prTbl } from "@git-dash/db";
import { PromisePool } from "@supercharge/promise-pool";
import { subDays } from "date-fns";
import { desc, lt, notInArray } from "drizzle-orm";

export const aggregate = async (
  repositories: { id: number; name: string }[],
  sharedDbClient: ReturnType<typeof getDbClient>,
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  configs: Configs,
) => {
  const maxOldPrDate = new Date(
    Date.now() -
      configs.GDASH_COLLECT_DAYS_LIGHT_TYPE_ITEMS /* days */ *
        60 *
        60 *
        24 *
        1000,
  );

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  const { errors } = await PromisePool.for(repositories)
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
          owner: configs.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 100,
          state: "all",
          sort: "updated",
          direction: "desc",
        },
        (response, done) => {
          if (
            response.data.find(
              (pr) =>
                new Date(pr.updated_at).getTime() < maxOldPrDate.getTime(),
            )
          ) {
            done();
          }
          return response.data;
        },
      );

      const recentPrs = prs.filter(
        (pr) => new Date(pr.updated_at) >= maxOldPrDate,
      );

      await PromisePool.for(recentPrs)
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(1)
        .process(async (pr) => {
          const authorId = pr.user?.id;
          if (!authorId) return;

          const renovateBotId = 29139614;
          if (authorId === renovateBotId) {
            logger.info(`Skip renovate #${pr.number}`);
            return;
          }

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

  // delete old prs
  await sharedDbClient
    .delete(prTbl)
    .where(
      lt(prTbl.createdAt, subDays(new Date(), configs.GDASH_DISCARD_DAYS)),
    );

  // TODO: ユーザごとにForで回して最後の10件のみタイトルを残す
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
        prTbl.id,
        latestPrs.map((pr) => pr.id),
      ),
    );

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }
};