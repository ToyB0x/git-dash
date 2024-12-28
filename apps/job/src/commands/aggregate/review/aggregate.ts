import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { prTbl, reviewTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { and, eq } from "drizzle-orm";

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
        `Start aggregate:review ${repository.name} (${i + 1}/${repositories.length})`,
      );

      // ref: https://docs.github.com/ja/rest/pulls/comments?apiVersion=2022-11-28#list-review-comments-in-a-repository
      const reviews = await octokit.paginate(
        octokit.rest.pulls.listReviewCommentsForRepo,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 100,
          sort: "created",
          direction: "desc",
        },
        (response, done) => {
          if (
            response.data.find(
              (review) =>
                new Date(review.created_at).getTime() <
                new Date(
                  Date.now() - 1 /* month */ * 60 * 60 * 24 * 30 * 1000,
                ).getTime(),
            )
          ) {
            done();
          }
          return response.data;
        },
      );

      await PromisePool.for(reviews)
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(1)
        .process(async (review) => {
          if (!review.pull_request_url) return;

          const prNumber = review.pull_request_url.split("/").slice(-1)[0];
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
          if (prs.find((pr) => pr.authorId === review.user.id)) return;
          const prId = prs[0]?.id;

          if (!prId) return;

          await sharedDbClient
            .insert(reviewTbl)
            .values({
              id: review.id,
              reviewerId: review.user.id,
              prId,
              createdAt: new Date(review.created_at),
            })
            .onConflictDoUpdate({
              target: reviewTbl.id,
              set: {
                reviewerId: review.user.id,
                prId,
                createdAt: new Date(review.created_at),
              },
            });
        });
    });
};
