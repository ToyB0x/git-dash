import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { prCommitTbl, prTbl, repositoryTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { subDays } from "date-fns";
import { and, eq, gte, lt } from "drizzle-orm";

export const aggregate = async () => {
  const octokit = await getOctokit();

  const recentPrs = await sharedDbClient
    .select({
      prId: prTbl.id,
      prNumber: prTbl.number,
      repositoryId: prTbl.repositoryId,
      repositoryName: repositoryTbl.name,
    })
    .from(prTbl)
    .where(
      and(gte(prTbl.updatedAt, subDays(new Date(), env.GDASH_COLLECT_DAYS))),
    )
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id));

  await PromisePool.for(recentPrs)
    .withConcurrency(8)
    .process(async (pr, i) => {
      logger.info(`Start aggregate:commit (${i + 1}/${recentPrs.length})`);

      // ref: https://docs.github.com/ja/rest/commits/commits?apiVersion=2022-11-28
      const commits = await octokit.paginate(octokit.rest.pulls.listCommits, {
        owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
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
              `authorId is null: https://github.com/${env.GDASH_GITHUB_ORGANIZATION_NAME}/${pr.repositoryName}/pull/${pr.prNumber}/commits/${commit.sha}`,
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
              commitAt: new Date(commitDateString),
            })
            .onConflictDoNothing({
              target: prCommitTbl.id,
            });
        });
    });

  // delete old commit
  await sharedDbClient
    .delete(prCommitTbl)
    .where(
      lt(prCommitTbl.commitAt, subDays(new Date(), env.GDASH_DISCARD_DAYS)),
    );
};
