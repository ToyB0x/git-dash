import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { eventTypes, prTbl, repositoryTbl, timelineTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { subDays } from "date-fns";
import { and, eq, gte, lt } from "drizzle-orm";

export const aggregate = async () => {
  const octokit = await getOctokit();

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
          subDays(new Date(), env.GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS),
        ),
      ),
    )
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id));

  const { errors } = await PromisePool.for(recentPrs)
    .withConcurrency(8)
    .process(async (pr, i) => {
      logger.info(`Start aggregate:timeline (${i + 1}/${recentPrs.length})`);
      const renovateBotId = 29139614;
      if (pr.prAuthorId === renovateBotId) {
        logger.info(
          `Skip renovate bot PR: ${pr.repositoryName}/pull/#${pr.prNumber}`,
        );
        return;
      }

      // ref: https://docs.github.com/ja/rest/issues/timeline?apiVersion=2022-11-28
      // ref: https://docs.github.com/ja/rest/using-the-rest-api/issue-event-types?apiVersion=2022-11-28
      // ref: https://docs.github.com/ja/rest/issues/events?apiVersion=2022-11-28#list-issue-events-for-a-repository
      // ref: https://gist.github.com/dahlbyk/229f6ee762e2b0b45f3add7c2459e64a
      const timelines = await octokit.paginate(
        octokit.rest.issues.listEventsForTimeline,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: pr.repositoryName,
          per_page: 100,
          issue_number: pr.prNumber,
        },
      );

      await PromisePool.for(timelines)
        .withConcurrency(1)
        .process(async (timeline) => {
          // commit eventの場合
          const isCommitEvent = "tree" in timeline;
          if (isCommitEvent) {
            // NOTE: Timeline中のcommit event は userId が含まれておらず userId と突合できない displayName や email しかないので別途 list commits で取得する
            return;
          }

          // それ以外のeventの場合
          const timelineId = "id" in timeline && timeline.id;
          if (!timelineId) {
            return;
          }

          const actorId = "actor" in timeline && timeline.actor.id;
          if (!actorId) {
            return;
          }

          const eventType = timeline.event;
          if (!eventTypes.includes(eventType as never)) {
            return;
          }

          await sharedDbClient
            .insert(timelineTbl)
            .values({
              id: timelineId,
              prId: pr.prId,
              actorId,
              requestedReviewerId:
                "requested_reviewer" in timeline
                  ? timeline.requested_reviewer.id
                  : null,
              eventType: eventType as never,
              repositoryId: pr.repositoryId,
              createdAt: new Date(timeline.created_at),
            })
            .onConflictDoNothing({
              target: timelineTbl.id,
            });
        });
    });

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }

  // delete old timelines
  await sharedDbClient
    .delete(timelineTbl)
    .where(
      lt(timelineTbl.createdAt, subDays(new Date(), env.GDASH_DISCARD_DAYS)),
    );
};
