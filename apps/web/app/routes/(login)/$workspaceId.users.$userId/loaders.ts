import type { getWasmDb } from "@/clients";
import {
  prCommitTbl,
  prTbl,
  repositoryTbl,
  reviewTbl,
  scanTbl,
  timelineTbl,
  userTbl,
} from "@git-dash/db";
import { endOfToday, startOfToday, subDays, subHours } from "date-fns";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  lt,
  not,
} from "drizzle-orm";
import type { ITimeEntry } from "react-time-heatmap";
import type { PR } from "./components";

export const loaderMaxOldPr = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => await db.select().from(prTbl).orderBy(asc(prTbl.createdAt)).get();

export const loaderMaxOldReview = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => await db.select().from(reviewTbl).orderBy(asc(reviewTbl.createdAt)).get();

export const sampleRecentPRs: PR[] = [
  {
    owner: "org",
    repository: "api",
    number: 1234,
    title: "Add new feature",
    numReview: 3,
    numCommit: 5,
    timeToMerge: 1000 * 60 * 60 * 24 * 3,
    // timeToReady: 1000 * 60 * 60 * 24 * 1,
    mergedAt: new Date("2024-09-23T13:00:00"),
    lastActivity: new Date("2024-09-23T13:00:00"),
  },
  {
    owner: "org",
    repository: "api",
    number: 1233,
    title: "Fix bug",
    numReview: 2,
    numCommit: 3,
    timeToMerge: 1000 * 60 * 60 * 24 * 2,
    // timeToReady: 1000 * 60 * 60 * 24 * 1,
    mergedAt: new Date("2024-09-22T10:45:00"),
    lastActivity: new Date("2024-09-22T10:45:00"),
  },
  {
    owner: "org",
    repository: "frontend",
    number: 1232,
    title: "Refactor",
    numReview: 1,
    numCommit: 2,
    timeToMerge: 1000 * 60 * 60 * 24 * 1,
    // timeToReady: 1000 * 60 * 60 * 24 * 1,
    mergedAt: new Date("2024-09-22T10:45:00"),
    lastActivity: new Date("2024-09-22T10:45:00"),
  },
  {
    owner: "org",
    repository: "frontend",
    number: 1231,
    title: "Add new feature",
    numReview: 1,
    numCommit: 2,
    timeToMerge: 1000 * 60 * 60 * 24 * 1,
    // timeToReady: 1000 * 60 * 60 * 24 * 1,
    mergedAt: new Date("2024-09-21T14:30:00"),
    lastActivity: new Date("2024-09-21 14:30:00"),
  },
];

export const loaderRecentPrs = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
): Promise<PR[]> => {
  const prs = await db
    .select({
      id: prTbl.id,
      owner: repositoryTbl.owner,
      repository: repositoryTbl.name,
      number: prTbl.number,
      title: prTbl.title,
      createdAt: prTbl.createdAt,
      mergedAt: prTbl.mergedAt,
      lastActivity: prTbl.updatedAt,
    })
    .from(prTbl)
    .where(eq(prTbl.authorId, userId))
    .orderBy(desc(prTbl.createdAt))
    .limit(30)
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id));

  return await Promise.all(
    prs.map(async (pr) => {
      const numReview = await db
        .select({ count: count() })
        .from(reviewTbl)
        .where(eq(reviewTbl.prId, pr.id))
        .get();

      const numCommit = await db
        .select({ count: count() })
        .from(prCommitTbl)
        .where(eq(prCommitTbl.prId, pr.id))
        .get();

      const timeToMerge = pr.mergedAt
        ? pr.mergedAt.getTime() - pr.createdAt.getTime()
        : null;

      // const timeToReady = pr.updatedAt.getTime() - pr.createdAt.getTime();

      return {
        ...pr,
        numReview: numReview?.count || 0,
        numCommit: numCommit?.count || 0,
        timeToMerge,
        // timeToReady,
      };
    }),
  );
};

export const loaderPrOpen = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const prs = await db
    .select()
    .from(prTbl)
    .where(eq(prTbl.authorId, userId))
    .orderBy(desc(prTbl.createdAt));

  return [...Array(300).keys()].map((_, i) => {
    return {
      date: subDays(startOfToday(), i),
      value: prs.filter(
        (pr) =>
          pr.createdAt >= subDays(startOfToday(), i) &&
          pr.createdAt < subDays(startOfToday(), i - 1),
      ).length,
    };
  });
};

export const loaderPrMerge = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const prs = await db
    .select()
    .from(prTbl)
    .where(eq(prTbl.authorId, userId))
    .orderBy(desc(prTbl.createdAt));

  return [...Array(300).keys()].map((_, i) => {
    return {
      date: subDays(startOfToday(), i),
      value: prs.filter(
        (pr) =>
          pr.mergedAt &&
          pr.mergedAt >= subDays(startOfToday(), i) &&
          pr.mergedAt < subDays(startOfToday(), i - 1),
      ).length,
    };
  });
};

export const loaderReviews = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const reviews = await db
    .select({
      id: reviewTbl.id,
      prId: reviewTbl.prId,
      prNumber: prTbl.number,
      createdAt: reviewTbl.createdAt,
      repoName: repositoryTbl.name,
      repoOwner: repositoryTbl.owner,
    })
    .from(reviewTbl)
    .innerJoin(userTbl, eq(userTbl.id, reviewTbl.reviewerId))
    .innerJoin(prTbl, eq(prTbl.id, reviewTbl.prId))
    .innerJoin(repositoryTbl, eq(repositoryTbl.id, prTbl.repositoryId))
    .where(eq(userTbl.id, userId))
    .orderBy(desc(reviewTbl.createdAt));

  return [...Array(300).keys()].map((_, i) => {
    return {
      date: subDays(startOfToday(), i),
      value: reviews.filter(
        (reviews) =>
          reviews.createdAt >= subDays(startOfToday(), i) &&
          reviews.createdAt < subDays(startOfToday(), i - 1),
      ).length,
    };
  });
};

export type Activity = {
  repository: string;
  prs: number;
  reviews: number;
  lastActivity: Date | string | undefined;
};

export const sampleActivity = [
  {
    repository: "org/api",
    prs: 124,
    reviews: 21,
    lastActivity: "23/09/2024 13:00",
  },
  {
    repository: "org/frontend",
    prs: 91,
    reviews: 12,
    lastActivity: "22/09/2024 10:45",
  },
  {
    repository: "org/payment",
    prs: 61,
    reviews: 9,
    lastActivity: "22/09/2024 10:45",
  },
  {
    repository: "org/backend",
    prs: 21,
    reviews: 3,
    lastActivity: "21/09/2024 14:30",
  },
  {
    repository: "org/serviceX",
    prs: 6,
    reviews: 1,
    lastActivity: "24/09/2024 09:15",
  },
  {
    repository: "org/serviceY",
    prs: 2,
    reviews: 1,
    lastActivity: "23/09/2024 21:42",
  },
  {
    repository: "org/serviceZ",
    prs: 1,
    reviews: 1,
    lastActivity: "21/09/2024 11:32",
  },
] satisfies Activity[];

export const loaderActivity = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const hasPrRepository = await db
    .selectDistinct({
      repositoryId: prTbl.repositoryId,
    })
    .from(prTbl)
    .where(eq(prTbl.authorId, userId))
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id));

  const hasReviewRepository = await db
    .selectDistinct({
      repositoryId: prTbl.repositoryId,
    })
    .from(reviewTbl)
    .innerJoin(prTbl, eq(prTbl.id, reviewTbl.prId))
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id))
    .where(eq(reviewTbl.reviewerId, userId));

  const relatedRepositoryIds = [
    ...new Set([
      ...hasPrRepository.map((pr) => pr.repositoryId),
      ...hasReviewRepository.map((review) => review.repositoryId),
    ]),
  ];

  return (await Promise.all(
    relatedRepositoryIds.map(async (repositoryId) => {
      const prs = await db
        .select()
        .from(prTbl)
        .where(
          and(
            eq(prTbl.authorId, userId),
            eq(prTbl.repositoryId, repositoryId),
            gte(prTbl.createdAt, subDays(startOfToday(), 180)),
          ),
        )
        .orderBy(desc(prTbl.createdAt));

      const reviews = await db
        .select({ createdAt: reviewTbl.createdAt })
        .from(reviewTbl)
        .leftJoin(prTbl, eq(prTbl.id, reviewTbl.prId))
        .where(
          and(
            eq(reviewTbl.reviewerId, userId),
            eq(prTbl.repositoryId, repositoryId),
            gte(reviewTbl.createdAt, subDays(startOfToday(), 180)),
          ),
        )
        .orderBy(desc(reviewTbl.createdAt));

      const repositoryNames = await db
        .select()
        .from(repositoryTbl)
        .where(eq(repositoryTbl.id, repositoryId));

      const repositoryName = repositoryNames[0]?.name;

      return {
        repository: repositoryName || "Unknown",
        prs: prs.length,
        reviews: reviews.length,
        lastActivity:
          prs[0]?.createdAt && reviews[0]?.createdAt
            ? prs[0]?.createdAt > reviews[0]?.createdAt
              ? prs[0]?.createdAt
              : reviews[0]?.createdAt
            : prs[0]?.createdAt || reviews[0]?.createdAt,
      };
    }),
  )) satisfies Activity[];
};

export const sampleHeatMap: ITimeEntry[] = [...Array(24 * 60).keys()].map(
  (hour) => ({
    time: subHours(endOfToday(), hour),
    count:
      subHours(endOfToday(), hour).getDay() <= 1
        ? Math.floor(Math.random() * 1.1) // 週末は低頻度にする
        : // 早朝深夜は低頻度にする
          subHours(endOfToday(), hour).getHours() < 8 ||
            subHours(endOfToday(), hour).getHours() > 20
          ? Math.floor(Math.random() * 1.1)
          : // 平日の昼間は高頻度にする
            Math.floor(Math.random() * 10),
  }),
);

export const loaderHeatMap = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const heatmap: ITimeEntry[] = await Promise.all(
    [...Array(24 * 60).keys()].map(async (hour) => ({
      time: subHours(endOfToday(), hour),
      count:
        ((
          await db
            .select({ count: count() })
            .from(prCommitTbl)
            .where(
              and(
                eq(prCommitTbl.authorId, userId),
                gte(prCommitTbl.commitAt, subHours(endOfToday(), hour)),
                lt(prCommitTbl.commitAt, subHours(endOfToday(), hour - 1)),
              ),
            )
        )[0]?.count || 0) +
        ((
          await db
            .select({ count: count() })
            .from(reviewTbl)
            .where(
              and(
                eq(reviewTbl.reviewerId, userId),
                gte(reviewTbl.createdAt, subHours(endOfToday(), hour)),
                lt(reviewTbl.createdAt, subHours(endOfToday(), hour - 1)),
              ),
            )
        )[0]?.count || 0),
    })),
  );

  return heatmap;
};

export const loaderTimeToMerge = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const mergedPrs = await db
    .select()
    .from(prTbl)
    .where(
      and(
        gte(prTbl.createdAt, subDays(new Date(), 60)),
        eq(prTbl.authorId, userId),
        isNotNull(prTbl.mergedAt),
      ),
    );
  const mergedPrsWithMsec = mergedPrs.map((pr) => ({
    ...pr,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    elapsedMsec: pr.mergedAt!.getTime() - pr.createdAt.getTime(),
  }));

  const sumIn30Days = mergedPrsWithMsec
    .filter((pr) => pr.createdAt > subDays(new Date(), 7))
    .reduce((acc, pr) => acc + pr.elapsedMsec, 0);
  const averageIn30Days = Math.round(
    sumIn30Days /
      mergedPrsWithMsec.filter((pr) => pr.createdAt > subDays(new Date(), 7))
        .length,
  );

  const sumInPrevSpan = mergedPrsWithMsec
    .filter(
      (pr) =>
        pr.createdAt <= subDays(new Date(), 30) &&
        pr.createdAt > subDays(new Date(), 60),
    )
    .reduce((acc, pr) => acc + pr.elapsedMsec, 0);
  const averageInPrevSpan = Math.round(
    sumInPrevSpan /
      mergedPrsWithMsec.filter(
        (pr) =>
          pr.createdAt <= subDays(new Date(), 30) &&
          pr.createdAt > subDays(new Date(), 60),
      ).length,
  );

  const aggregationBase = [
    {
      title: "0.5 day",
      diffStart: 0,
      diffEnd: 60 * 60 * 12 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-green-600 dark:bg-green-500",
    },
    {
      title: "0.6~1 day",
      diffStart: 60 * 60 * 12 * 1000,
      diffEnd: 60 * 60 * 24 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-purple-600 dark:bg-purple-500",
    },

    {
      title: "2~3 days",
      diffStart: 60 * 60 * 24 * 1000,
      diffEnd: 60 * 60 * 24 * 3 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-indigo-600 dark:bg-indigo-500",
    },
    {
      title: "4~ days",
      diffStart: 60 * 60 * 24 * 3 * 1000,
      diffEnd: 60 * 60 * 24 * 60 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-gray-400 dark:bg-gray-600",
    },
  ];

  const bars = aggregationBase.map((base) => ({
    ...base,
    value: `${
      mergedPrsWithMsec
        .filter((pr) => pr.createdAt > subDays(new Date(), 30))
        .filter(
          (msec) =>
            msec.elapsedMsec >= base.diffStart &&
            msec.elapsedMsec < base.diffEnd,
        ).length
    } PRs`,
    percentage:
      Math.round(
        10 *
          (mergedPrsWithMsec
            .filter((pr) => pr.createdAt > subDays(new Date(), 30))
            .filter(
              (msec) =>
                msec.elapsedMsec >= base.diffStart &&
                msec.elapsedMsec < base.diffEnd,
            ).length /
            mergedPrsWithMsec.filter(
              (pr) => pr.createdAt > subDays(new Date(), 30),
            ).length) *
          100,
      ) / 10,
  }));

  return {
    averageIn30Days,
    averageInPrevSpan,
    improvePercentage:
      (averageInPrevSpan - averageIn30Days > 0 ? "+" : "") +
      Math.round(
        ((averageInPrevSpan - averageIn30Days) / averageInPrevSpan) * 100,
      ),
    bars,
  };
};

export const loaderTimeToReview = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const recentPrIds = await db
    .selectDistinct({ prId: prTbl.id })
    .from(prTbl)
    .where(and(gte(prTbl.createdAt, subDays(new Date(), 60))));

  const renovateBotId = 29139614;

  // NOTE: このBarグラフ部分のレビュー数と、折れ線グラフ部分のレビュー数が一致しない原因として、
  // この関数内でのレビュー数は、レビューリクエストをもとに計算しているため、
  // 回答していないレビューリクエストがある場合、レビュー数がカウントされてしまうため
  const reviewRequests = await db
    .select()
    .from(timelineTbl)
    .where(
      and(
        eq(timelineTbl.eventType, "review_requested"),
        eq(timelineTbl.requestedReviewerId, userId),
        not(eq(timelineTbl.actorId, renovateBotId)),
        inArray(
          timelineTbl.prId,
          recentPrIds.map((pr) => pr.prId),
        ),
      ),
    );

  let noAnsweredCount = 0;

  const reviewResults = await Promise.all(
    reviewRequests
      .filter((request) => request.actorId !== renovateBotId)
      .map(async (request) => {
        const firstReviewsAfterRequested = await db
          .select()
          .from(timelineTbl)
          .orderBy(timelineTbl.createdAt)
          .where(
            and(
              eq(timelineTbl.prId, request.prId),
              eq(timelineTbl.eventType, "reviewed"),
              eq(timelineTbl.actorId, userId),
              gt(timelineTbl.createdAt, request.createdAt),
            ),
          )
          .limit(1);

        const firstReviewAfterRequested = firstReviewsAfterRequested[0];
        // レビューされていない場合
        if (!firstReviewAfterRequested) {
          const mergedPrs = await db
            .select()
            .from(prTbl)
            .where(and(eq(prTbl.id, request.prId), isNotNull(prTbl.mergedAt)));

          // レビューされずにマージされた場合は、マージ日時までの差分を待ち時間とする
          const mergedAt = mergedPrs[0]?.mergedAt;
          if (mergedAt) {
            noAnsweredCount++;
            return {
              ...request,
              elapsedMsec: mergedAt.getTime() - request.createdAt.getTime(),
            };
          }

          // レビューされずにマージもされていない場合は、前回スキャン日時までの差分を待ち時間とする
          const lastScan = await db
            .select()
            .from(scanTbl)
            .orderBy(desc(scanTbl.createdAt))
            .limit(1);
          return {
            ...request,
            elapsedMsec: lastScan[0]
              ? lastScan[0].createdAt.getTime() - request.createdAt.getTime()
              : Date.now() - request.createdAt.getTime(),
          };
        }

        return {
          ...request,
          elapsedMsec:
            firstReviewAfterRequested.createdAt.getTime() -
            request.createdAt.getTime(),
        };
      }),
  );

  console.log({ noAnsweredCount });

  const sumIn30Days = reviewResults
    .filter((result) => result.createdAt > subDays(new Date(), 7))
    // NOTE: 5日以上かかった外れ値を除外する例
    // .filter((result) => result.elapsedMsec < 5 * 60 * 60 * 24 * 1000)
    .reduce((acc, result) => acc + result.elapsedMsec, 0);
  // TODO: この部分が必ずレビューを返した全体の計算になっているので修正
  const averageIn30Days = Math.round(
    sumIn30Days /
      reviewResults.filter(
        (result) => result.createdAt > subDays(new Date(), 7),
      ).length,
  );

  const sumInPrevSpan = reviewResults
    .filter(
      (result) =>
        result.createdAt <= subDays(new Date(), 30) &&
        result.createdAt > subDays(new Date(), 60),
    )
    .reduce((acc, result) => acc + result.elapsedMsec, 0);

  const averageInPrevSpan = Math.round(
    sumInPrevSpan /
      reviewResults.filter(
        (result) =>
          result.createdAt <= subDays(new Date(), 30) &&
          result.createdAt > subDays(new Date(), 60),
      ).length,
  );

  const aggregationBase = [
    {
      title: "0.5 day",
      diffStart: 0,
      diffEnd: 60 * 60 * 12 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-green-600 dark:bg-green-500",
    },
    {
      title: "0.6~1 day",
      diffStart: 60 * 60 * 12 * 1000,
      diffEnd: 60 * 60 * 24 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-purple-600 dark:bg-purple-500",
    },

    {
      title: "2~3 days",
      diffStart: 60 * 60 * 24 * 1000,
      diffEnd: 60 * 60 * 24 * 3 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-indigo-600 dark:bg-indigo-500",
    },
    {
      title: "4~ days",
      diffStart: 60 * 60 * 24 * 3 * 1000,
      diffEnd: 60 * 60 * 24 * 60 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-gray-400 dark:bg-gray-600",
    },
  ];

  const bars = aggregationBase.map((base) => ({
    ...base,
    value: `${
      reviewResults
        .filter((review) => review.createdAt > subDays(new Date(), 30))
        .filter(
          (msec) =>
            msec.elapsedMsec >= base.diffStart &&
            msec.elapsedMsec < base.diffEnd,
        ).length
    } Reviews`,
    percentage:
      Math.round(
        10 *
          (reviewResults
            .filter((review) => review.createdAt > subDays(new Date(), 30))
            .filter(
              (msec) =>
                msec.elapsedMsec >= base.diffStart &&
                msec.elapsedMsec < base.diffEnd,
            ).length /
            reviewResults.filter(
              (review) => review.createdAt > subDays(new Date(), 30),
            ).length) *
          100,
      ) / 10,
  }));

  return {
    averageIn30Days,
    averageInPrevSpan,
    improvePercentage: Number.isNaN(averageInPrevSpan - averageIn30Days)
      ? null
      : (averageInPrevSpan - averageIn30Days > 0 ? "+" : "") +
        Math.round(
          ((averageInPrevSpan - averageIn30Days) / averageInPrevSpan) * 100,
        ),
    bars,
  };
};

export const loaderTimeToReviewed = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  userId: number,
) => {
  const recentPrIds = await db
    .selectDistinct({ prId: prTbl.id })
    .from(prTbl)
    .where(and(gte(prTbl.createdAt, subDays(new Date(), 60))));

  const reviewRequests = await db
    .select()
    .from(timelineTbl)
    .where(
      and(
        eq(timelineTbl.eventType, "review_requested"),
        eq(timelineTbl.actorId, userId),
        inArray(
          timelineTbl.prId,
          recentPrIds.map((pr) => pr.prId),
        ),
      ),
    );

  const renovateBotId = 29139614;
  const reviewResults = await Promise.all(
    reviewRequests
      .filter((request) => request.actorId !== renovateBotId)
      .filter(
        (
          request,
        ): request is NonNullable<
          typeof request & {
            requestedReviewerId: number;
          }
        > => !!request.requestedReviewerId,
      )
      .map(async (request) => {
        const firstReviewsAfterRequested = await db
          .select()
          .from(timelineTbl)
          .orderBy(timelineTbl.createdAt)
          .where(
            and(
              eq(timelineTbl.prId, request.prId),
              eq(timelineTbl.eventType, "reviewed"),
              eq(timelineTbl.actorId, request.requestedReviewerId),
              gt(timelineTbl.createdAt, request.createdAt),
            ),
          )
          .limit(1);

        // レビューされていない場合
        const firstReviewAfterRequested = firstReviewsAfterRequested[0];

        if (!firstReviewAfterRequested) {
          const mergedPrs = await db
            .select()
            .from(prTbl)
            .where(and(eq(prTbl.id, request.prId), isNotNull(prTbl.mergedAt)));

          // レビューされずにマージされた場合は、マージ日時までの差分を待ち時間とする
          const mergedAt = mergedPrs[0]?.mergedAt;
          if (mergedAt) {
            return {
              ...request,
              elapsedMsec: mergedAt.getTime() - request.createdAt.getTime(),
            };
          }

          // レビューされずにマージもされていない場合は、前回スキャン日時までの差分を待ち時間とする
          const lastScan = await db
            .select()
            .from(scanTbl)
            .orderBy(desc(scanTbl.createdAt))
            .limit(1);
          return {
            ...request,
            elapsedMsec: lastScan[0]
              ? lastScan[0].createdAt.getTime() - request.createdAt.getTime()
              : Date.now() - request.createdAt.getTime(),
          };
        }

        return {
          ...request,
          elapsedMsec:
            firstReviewAfterRequested.createdAt.getTime() -
            request.createdAt.getTime(),
        };
      }),
  );

  const sumIn30Days = reviewResults
    .filter((result) => result.createdAt > subDays(new Date(), 7))
    // NOTE: 5日以上かかった外れ値を除外する例
    // .filter((result) => result.elapsedMsec < 5 * 60 * 60 * 24 * 1000)
    .reduce((acc, result) => acc + result.elapsedMsec, 0);

  const averageIn30Days = Math.round(
    sumIn30Days /
      reviewResults.filter(
        (result) => result.createdAt > subDays(new Date(), 7),
      ).length,
  );

  const sumInPrevSpan = reviewResults
    .filter(
      (result) =>
        result.createdAt <= subDays(new Date(), 30) &&
        result.createdAt > subDays(new Date(), 60),
    )
    .reduce((acc, result) => acc + result.elapsedMsec, 0);

  const averageInPrevSpan = Math.round(
    sumInPrevSpan /
      reviewResults.filter(
        (result) =>
          result.createdAt <= subDays(new Date(), 30) &&
          result.createdAt > subDays(new Date(), 60),
      ).length,
  );

  const aggregationBase = [
    {
      title: "0.5 day",
      diffStart: 0,
      diffEnd: 60 * 60 * 12 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-green-600 dark:bg-green-500",
    },
    {
      title: "0.6~1 day",
      diffStart: 60 * 60 * 12 * 1000,
      diffEnd: 60 * 60 * 24 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-purple-600 dark:bg-purple-500",
    },

    {
      title: "2~3 days",
      diffStart: 60 * 60 * 24 * 1000,
      diffEnd: 60 * 60 * 24 * 3 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-indigo-600 dark:bg-indigo-500",
    },
    {
      title: "4~ days",
      diffStart: 60 * 60 * 24 * 3 * 1000,
      diffEnd: 60 * 60 * 24 * 60 * 1000,
      value: 0,
      percentage: 0,
      color: "bg-gray-400 dark:bg-gray-600",
    },
  ];

  const bars = aggregationBase.map((base) => ({
    ...base,
    value: `${
      reviewResults
        .filter((review) => review.createdAt > subDays(new Date(), 30))
        .filter(
          (msec) =>
            msec.elapsedMsec >= base.diffStart &&
            msec.elapsedMsec < base.diffEnd,
        ).length
    } Reviews`,
    percentage:
      Math.round(
        10 *
          (reviewResults
            .filter((review) => review.createdAt > subDays(new Date(), 30))
            .filter(
              (msec) =>
                msec.elapsedMsec >= base.diffStart &&
                msec.elapsedMsec < base.diffEnd,
            ).length /
            reviewResults.filter(
              (review) => review.createdAt > subDays(new Date(), 30),
            ).length) *
          100,
      ) / 10,
  }));

  return {
    averageIn30Days,
    averageInPrevSpan,
    improvePercentage: Number.isNaN(averageInPrevSpan - averageIn30Days)
      ? null
      : (averageInPrevSpan - averageIn30Days > 0 ? "+" : "") +
        Math.round(
          ((averageInPrevSpan - averageIn30Days) / averageInPrevSpan) * 100,
        ),
    bars,
  };
};
