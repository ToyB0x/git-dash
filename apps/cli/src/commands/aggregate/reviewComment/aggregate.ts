import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { prTbl, reviewCommentTbl } from "@git-dash/db";
import { PromisePool } from "@supercharge/promise-pool";
import { subDays } from "date-fns";
import { and, eq, lt } from "drizzle-orm";

export const aggregate = async (
  repositories: { id: number; name: string }[],
  sharedDbClient: ReturnType<typeof getDbClient>,
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  configs: Configs,
  maxOldDate?: Date,
) => {
  const maxOldReviewDate =
    maxOldDate ??
    new Date(
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
        `Start aggregate:review-comment ${repository.name} (${i + 1}/${repositories.length})`,
      );

      // ref: https://docs.github.com/ja/rest/pulls/comments?apiVersion=2022-11-28#list-review-comments-in-a-repository
      const reviewComments = await octokit.paginate(
        octokit.rest.pulls.listReviewCommentsForRepo,
        {
          owner: configs.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 100,
          sort: "created",
          direction: "desc",
        },
        (response, done) => {
          // 指定期間以上取得した場合は終了
          if (
            response.data.find(
              (review) =>
                new Date(review.created_at).getTime() <
                maxOldReviewDate.getTime(),
            )
          ) {
            done();
          }

          // 既に過去に取得済みの場合は終了 (1日のReviewは通常ページング上限の100件に収まることが多くあまり意味がないためコメントアウト)
          // if (
          //   response.data.find((review) => {
          //     const matchedRecords = sharedDbClient
          //       .select()
          //       .from(reviewTbl)
          //       .where(eq(reviewTbl.id, review.id));
          //
          //     const matchedRecord = matchedRecords[0];
          //     if (!matchedRecord) return false;
          //
          //     const pr = sharedDbClient
          //       .select()
          //       .from(prTbl)
          //       .where(eq(prTbl.id, matchedRecord.prId));
          //
          //     // 過去に取得済みのPRかつ、そのPRがマージされている場合は終了
          //     if (!pr[0]) return !!pr[0].mergedAt;
          //   })
          // ) {
          //   done();
          // }

          return response.data;
        },
      );

      await PromisePool.for(reviewComments)
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(1)
        .process(async (reviewComment) => {
          if (!reviewComment.pull_request_url) return;

          const prNumber = reviewComment.pull_request_url
            .split("/")
            .slice(-1)[0];
          if (!prNumber) return;

          const prs = await sharedDbClient
            .select()
            .from(prTbl)
            .where(
              and(
                eq(prTbl.number, Number(prNumber)),
                eq(prTbl.repositoryId, repository.id),
              ),
            );

          // Skip self review
          if (prs.find((pr) => pr.authorId === reviewComment.user.id)) return;
          const prId = prs[0]?.id;

          if (!prId) return;

          await sharedDbClient
            .insert(reviewCommentTbl)
            .values({
              id: reviewComment.id,
              reviewerId: reviewComment.user.id,
              prId,
              pullRequestReviewId: reviewComment.pull_request_review_id,
              repositoryId: repository.id,
              createdAt: new Date(reviewComment.created_at),
            })
            .onConflictDoUpdate({
              target: reviewCommentTbl.id,
              set: {
                reviewerId: reviewComment.user.id,
                prId,
                pullRequestReviewId: reviewComment.pull_request_review_id,
                createdAt: new Date(reviewComment.created_at),
              },
            });
        });
    });

  // delete old reviews
  await sharedDbClient
    .delete(reviewCommentTbl)
    .where(
      lt(
        reviewCommentTbl.createdAt,
        subDays(new Date(), configs.GDASH_DISCARD_DAYS),
      ),
    );

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }
};
