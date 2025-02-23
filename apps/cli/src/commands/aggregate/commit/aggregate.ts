import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { prCommitTbl, prTbl, repositoryTbl } from "@git-dash/db";
import { PromisePool } from "@supercharge/promise-pool";
import { subDays } from "date-fns";
import { and, eq, gte, lt } from "drizzle-orm";

export const aggregate = async (
  sharedDbClient: ReturnType<typeof getDbClient>,
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  configs: Configs,
  heatmapDaysAgo?: number,
  enableInsertCommitMessage = false,
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
      logger.info(`Start aggregate:commit (${i + 1}/${recentPrs.length})`);
      const renovateBotId = 29139614;
      if (pr.prAuthorId === renovateBotId) {
        logger.info(
          `Skip renovate bot PR: ${pr.repositoryName}/pull/#${pr.prNumber}`,
        );
        return;
      }

      // ref: https://docs.github.com/ja/rest/commits/commits?apiVersion=2022-11-28
      const commits = await octokit.paginate(octokit.rest.pulls.listCommits, {
        owner: configs.GDASH_GITHUB_ORGANIZATION_NAME,
        repo: pr.repositoryName,
        pull_number: pr.prNumber,
        per_page: 100,
      });

      await PromisePool.for(commits)
        .withConcurrency(1)
        .process(async (commit) => {
          const authorId = commit.author?.id;
          if (!authorId) {
            logger.warn(
              `authorId is null: https://github.com/${configs.GDASH_GITHUB_ORGANIZATION_NAME}/${pr.repositoryName}/pull/${pr.prNumber}/commits/${commit.sha}`,
            );
            return;
          }

          const commitDateString = commit.commit.committer?.date;
          if (!commitDateString) {
            logger.warn(`commitDateString is null: ${commit.sha}`);
            return;
          }

          await sharedDbClient
            .insert(prCommitTbl)
            .values({
              id: commit.sha,
              prId: pr.prId,
              authorId,
              message: enableInsertCommitMessage ? commit.commit.message : null,
              repositoryId: pr.repositoryId,
              commitAt: new Date(commitDateString),
            })
            .onConflictDoUpdate({
              target: prCommitTbl.id,
              set: {
                message: enableInsertCommitMessage
                  ? commit.commit.message
                  : null,
              },
            });
        });
    });

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }

  // delete old commit
  await sharedDbClient
    .delete(prCommitTbl)
    .where(
      lt(prCommitTbl.commitAt, subDays(new Date(), configs.GDASH_DISCARD_DAYS)),
    );
};
