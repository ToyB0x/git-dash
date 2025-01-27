import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { eventTypes, prTbl, repositoryTbl, timelineTbl } from "@git-dash/db";
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
          owner: configs.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: pr.repositoryName,
          per_page: 100,
          issue_number: pr.prNumber,
        },
      );

      await PromisePool.for(timelines)
        .withConcurrency(1)
        .process(async (timeline) => {
          // 以下の時は"author", "committer" が存在する (actorもuserも存在しない)
          // - "event": "committed"
          // NOTE: Timeline中のcommit event は userId が含まれておらず userId と突合できない、偽造可能な displayName や email しかないので別途 list commits で取得する
          const isCommitEvent = "tree" in timeline;
          if (isCommitEvent) {
            return;
          }

          // それ以外のeventの場合
          const timelineId = "id" in timeline && timeline.id;
          if (!timelineId) {
            return;
          }

          // NOTE:
          // 以下の時はuserのみ存在 (actorもauthorも存在しない)
          // - "event": "reviewed"
          // ("state": "commented", "state": "approved", "state": "changes_requested" なども持つ)
          //
          // 以下の時はactorのみ存在 (authorもuserも存在しない)
          // - "event": "review_requested",
          // - "event": "commented",
          // - "event": "merged",
          // - "event": "assigned",
          // - "event": "deployed",
          // - "event": "renamed",
          const actorId =
            ("actor" in timeline && timeline.actor.id) ||
            ("user" in timeline && timeline.user.id);
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
              createdAt:
                "created_at" in timeline
                  ? new Date(timeline.created_at) // event reviewed 以外
                  : "submitted_at" in timeline
                    ? // event reviewed の場合
                      new Date(timeline.submitted_at)
                    : new Date(), // 日時が取得できない場合は集計日時で代用
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
      lt(
        timelineTbl.createdAt,
        subDays(new Date(), configs.GDASH_DISCARD_DAYS),
      ),
    );
};
