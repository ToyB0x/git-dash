import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { prTbl, repositoryTbl, reviewTbl } from "@git-dash/db";
import { PromisePool } from "@supercharge/promise-pool";
import { subDays } from "date-fns";
import { and, eq, gte, lt } from "drizzle-orm";

export const aggregate = async (
  sharedDbClient: ReturnType<typeof getDbClient>,
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  configs: Configs,
  heatmapDaysAgo?: number,
) => {
  const recentPrs = await sharedDbClient
    .select({
      prId: prTbl.id,
      prNumber: prTbl.number,
      prAuthorId: prTbl.authorId,
      repositoryId: prTbl.repositoryId,
      repositoryName: repositoryTbl.name,
    })
    .from(prTbl)
    .where(
      and(
        gte(
          prTbl.updatedAt,
          subDays(
            new Date(),
            heatmapDaysAgo
              ? heatmapDaysAgo
              : configs.GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS,
          ),
        ),
      ),
    )
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id));

  const { errors } = await PromisePool.for(recentPrs)
    .withConcurrency(8)
    .process(async (pr, i) => {
      logger.info(`Start aggregate:review (${i + 1}/${recentPrs.length})`);
      const renovateBotId = 29139614;
      if (pr.prAuthorId === renovateBotId) {
        logger.info(
          `Skip renovate bot PR: ${pr.repositoryName}/pull/#${pr.prNumber}`,
        );
        return;
      }

      // https://docs.github.com/ja/rest/pulls/reviews?apiVersion=2022-11-28
      const reviews = await octokit.paginate(octokit.rest.pulls.listReviews, {
        owner: configs.GDASH_GITHUB_ORGANIZATION_NAME,
        repo: pr.repositoryName,
        per_page: 100,
        pull_number: pr.prNumber,
      });

      await PromisePool.for(reviews)
        .withConcurrency(1)
        .process(async (review) => {
          // TODO: filter bot user
          const reviewerId = review.user?.id;
          if (!reviewerId) return;

          await sharedDbClient
            .insert(reviewTbl)
            .values({
              id: review.id,
              prId: pr.prId,
              state: review.state,
              reviewerId: reviewerId,
              repositoryId: pr.repositoryId,
              createdAt: review.submitted_at
                ? new Date(review.submitted_at)
                : new Date(),
            })
            .onConflictDoNothing({
              target: reviewTbl.id,
            });
        });
    });

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }

  // delete old review
  await sharedDbClient
    .delete(reviewTbl)
    .where(
      lt(reviewTbl.createdAt, subDays(new Date(), configs.GDASH_DISCARD_DAYS)),
    );
};
