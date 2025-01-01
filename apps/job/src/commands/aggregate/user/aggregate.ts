import { getOctokit, sharedDbClient } from "@/clients";
import { logger } from "@/utils";
import {
  prCommitTbl,
  prTbl,
  releaseTbl,
  reviewTbl,
  timelineTbl,
  userTbl,
} from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { gte } from "drizzle-orm";

export const aggregate = async () => {
  const octokit = await getOctokit();
  const prs = await sharedDbClient
    .selectDistinct({ authorId: prTbl.authorId })
    .from(prTbl);

  const reviews = await sharedDbClient
    .selectDistinct({ authorId: reviewTbl.reviewerId })
    .from(reviewTbl);

  const releases = await sharedDbClient
    .selectDistinct({ authorId: releaseTbl.authorId })
    .from(releaseTbl);

  const timelines = await sharedDbClient
    .selectDistinct({ actorId: timelineTbl.actorId })
    .from(timelineTbl);

  const commits = await sharedDbClient
    .selectDistinct({ authorId: prCommitTbl.authorId })
    .from(prCommitTbl);

  const userIds = new Set([
    ...prs.map((pr) => pr.authorId),
    ...reviews.map((review) => review.authorId),
    ...releases.map((release) => release.authorId),
    ...timelines.map((timeline) => timeline.actorId),
    ...commits.map((commit) => commit.authorId),
  ]);

  const recentUsers = await sharedDbClient
    .select()
    .from(userTbl)
    .where(
      gte(userTbl.updatedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    );

  // NOTE: DBに存在しないが過去に存在していたユーザやBotアカウントなどは毎回取得してしまうことに留意
  // 直近7日以内にデータ更新されていないユーザのみ取得
  const scanUserIds = [...userIds].filter(
    (userId) => !recentUsers.find((user) => user.id === userId),
  );

  const { errors } = await PromisePool.for(scanUserIds)
    // 8 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (userId, i) => {
      logger.info(`Start aggregate:user ${userId} (${i + 1}/${userIds.size})`);

      // 認証していないrequestを使い、Quotaの消費を回避することもできるがRateLimitが厳しすぎるため、認証済みのoctokitを使う
      // ref: https://docs.github.com/ja/rest/users/users?apiVersion=2022-11-28#get-a-user-using-their-id
      const user = await octokit.request("GET /user/{account_id}", {
        account_id: userId,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      const login = user.data.login as string;
      const avatar_url = user.data.avatar_url as string;
      const name = user.data.name as string | null;
      const blog = user.data.blog as string | null;
      const updated_at = user.data.updated_at as string;

      if (!login || !avatar_url || !updated_at) return;

      await sharedDbClient
        .insert(userTbl)
        .values({
          id: userId,
          login: login,
          name: name,
          blog: blog,
          avatarUrl: avatar_url,
          updatedAt: new Date(updated_at),
        })
        .onConflictDoUpdate({
          target: userTbl.id,
          set: {
            login: login,
            name: name,
            blog: blog,
            avatarUrl: avatar_url,
            updatedAt: new Date(updated_at),
          },
        });
    });

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }
};
