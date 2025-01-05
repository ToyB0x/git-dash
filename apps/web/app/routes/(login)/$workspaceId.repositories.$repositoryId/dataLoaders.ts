import type { getWasmDb } from "@/clients";
import { generateDailyData } from "@/lib/generateDailyData";
import { prTbl, releaseTbl, scanTbl, timelineTbl } from "@git-dash/db";
import { subDays } from "date-fns";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  not,
} from "drizzle-orm";

type GraphData = {
  version: "0.1";
  type:
    | "Release"
    | "ChangeLeadTime"
    | "ChangeFailureRate"
    | "FailedDeploymentRecoveryTime"
    | "Critical"
    | "High"
    | "Low";
  data: {
    date: Date;
    value: number;
  }[];
};

export const dataLoaderRelease = async (
  params:
    | {
        isDemo: true;
      }
    | {
        isDemo: false;
        repositoryId: number;
        db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>;
      },
): Promise<GraphData> => {
  if (params.isDemo) {
    return {
      type: "Release",
      version: "0.1",
      data: generateDailyData({
        startDate: new Date(
          Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
        ),
        endDate: new Date(),
        min: 1,
        max: 6,
        variance: 2.5,
        weekendReduction: true,
      }),
    };
  }

  const releases = await params.db
    .select()
    .from(releaseTbl)
    .orderBy(asc(releaseTbl.publishedAt))
    .where(
      and(
        eq(releaseTbl.repositoryId, params.repositoryId),
        gte(releaseTbl.publishedAt, subDays(new Date(), 60)),
      ),
    );

  return {
    type: "Release",
    version: "0.1",
    data: [...Array(60).keys()].map((i) => {
      const date = subDays(new Date(), 60 - i);
      const value = releases.filter(
        (release) =>
          release.publishedAt &&
          release.publishedAt.getDate() === date.getDate() &&
          release.publishedAt.getMonth() === date.getMonth() &&
          release.publishedAt.getFullYear() === date.getFullYear(),
      ).length;
      return { date, value };
    }),
  };
};

export const dataLoaderChangeLeadTime = async (
  params:
    | {
        isDemo: true;
      }
    | {
        isDemo: false;
        repositoryId: number;
        db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>;
      },
): Promise<GraphData> => {
  if (params.isDemo) {
    return {
      type: "ChangeLeadTime",
      version: "0.1",
      data: generateDailyData({
        startDate: new Date(
          Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
        ),
        endDate: new Date(),
        min: 10,
        max: 50,
        variance: 0.01,
        weekendReduction: true,
      }),
    };
  }

  const mergedPrs = await params.db
    .select()
    .from(prTbl)
    .where(
      and(
        gte(prTbl.createdAt, subDays(new Date(), 60)),
        eq(prTbl.repositoryId, params.repositoryId),
        isNotNull(prTbl.mergedAt),
      ),
    )
    .orderBy(asc(prTbl.createdAt));

  const releases = await params.db
    .select()
    .from(releaseTbl)
    .where(
      and(
        eq(releaseTbl.repositoryId, params.repositoryId),
        gte(releaseTbl.publishedAt, subDays(new Date(), 60)),
      ),
    )
    .orderBy(asc(releaseTbl.publishedAt));

  // calculate lead time
  const leadTimes = mergedPrs.map((pr) => {
    const release = releases.find(
      (release) =>
        pr.mergedAt &&
        release.publishedAt &&
        // MainのHeadでリリースしたことが前提
        release.publishedAt.getTime() > pr.mergedAt.getTime(),
    );

    if (!release) {
      return null;
    }

    return {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      date: pr.mergedAt!,
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      value: release.publishedAt!.getTime() - pr.mergedAt!.getTime(),
    };
  });

  return {
    type: "ChangeLeadTime",
    version: "0.1",
    data: [...Array(60).keys()].map((i) => {
      const date = subDays(new Date(), 60 - i);
      const values = leadTimes.filter(
        (leadTime): leadTime is NonNullable<typeof leadTime> =>
          !!leadTime &&
          leadTime.date.getDate() === date.getDate() &&
          leadTime.date.getMonth() === date.getMonth() &&
          leadTime.date.getFullYear() === date.getFullYear(),
      );

      const dailySumInHour =
        values.reduce((acc, leadTime) => acc + leadTime.value, 0) /
        1000 /
        60 /
        60;

      // 1日のPRひとつあたりの平均リードタイム
      const dailyAverage = Math.round(dailySumInHour / values.length);

      return { date, value: dailyAverage };
    }),
  };
};

export const dataLoaderChangeFailureRate = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "ChangeFailureRate",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 8,
      variance: 0.3,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderFailedDeploymentRecoveryTime = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "FailedDeploymentRecoveryTime",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 6,
      variance: 2.5,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderVulnerabilityCritical = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Critical",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 10,
      max: 30,
      variance: 0.05,
      weekendReduction: false,
    }),
  };
};

export const dataLoaderVulnerabilityHigh = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "High",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 10,
      max: 50,
      variance: 0.05,
      weekendReduction: false,
    }),
  };
};

export const dataLoaderVulnerabilityLow = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Low",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 50,
      max: 120,
      variance: 0.5,
      weekendReduction: false,
    }),
  };
};

const renovateBotId = 29139614;

export const dataLoaderTimeToMerge = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  repositoryId: number,
) => {
  const mergedPrs = await db
    .select()
    .from(prTbl)
    .where(
      and(
        gte(prTbl.createdAt, subDays(new Date(), 60)),
        eq(prTbl.repositoryId, repositoryId),
        not(eq(prTbl.authorId, renovateBotId)),
        isNotNull(prTbl.mergedAt),
      ),
    );
  const mergedPrsWithMsec = mergedPrs.map((pr) => ({
    ...pr,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    elapsedMsec: pr.mergedAt!.getTime() - pr.createdAt.getTime(),
  }));

  const sumIn30Days = mergedPrsWithMsec
    .filter((pr) => pr.createdAt > subDays(new Date(), 30))
    .reduce((acc, pr) => acc + pr.elapsedMsec, 0);
  const averageIn30Days = Math.round(
    sumIn30Days /
      mergedPrsWithMsec.filter((pr) => pr.createdAt > subDays(new Date(), 30))
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

export const dataLoaderTimeToReview = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  repositoryId: number,
) => {
  const recentPrIds = await db
    .selectDistinct({ prId: prTbl.id })
    .from(prTbl)
    .where(
      and(
        eq(prTbl.repositoryId, repositoryId),
        gte(prTbl.createdAt, subDays(new Date(), 60)),
      ),
    );

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
        eq(timelineTbl.repositoryId, repositoryId),
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
      .filter(
        (
          request,
        ): request is NonNullable<
          typeof request & { requestedReviewerId: number }
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
    .filter((result) => result.createdAt > subDays(new Date(), 30))
    // NOTE: 5日以上かかった外れ値を除外する例
    // .filter((result) => result.elapsedMsec < 5 * 60 * 60 * 24 * 1000)
    .reduce((acc, result) => acc + result.elapsedMsec, 0);
  // TODO: この部分が必ずレビューを返した全体の計算になっているので修正
  const averageIn30Days = Math.round(
    sumIn30Days /
      reviewResults.filter(
        (result) => result.createdAt > subDays(new Date(), 30),
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

// NOTE: リポジトリ全体で見れば、レビューするまでの時間と、レビューされるまでの時間は同じになる？
export const dataLoaderTimeToReviewed = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
  repositoryId: number,
) => {
  const recentPrIds = await db
    .selectDistinct({ prId: prTbl.id })
    .from(prTbl)
    .where(
      and(
        gte(prTbl.createdAt, subDays(new Date(), 60)),
        eq(prTbl.repositoryId, repositoryId),
      ),
    );

  const reviewRequests = await db
    .select()
    .from(timelineTbl)
    .where(
      and(
        eq(timelineTbl.eventType, "review_requested"),
        eq(timelineTbl.repositoryId, repositoryId),
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
    .filter((result) => result.createdAt > subDays(new Date(), 30))
    // NOTE: 5日以上かかった外れ値を除外する例
    // .filter((result) => result.elapsedMsec < 5 * 60 * 60 * 24 * 1000)
    .reduce((acc, result) => acc + result.elapsedMsec, 0);

  const averageIn30Days = Math.round(
    sumIn30Days /
      reviewResults.filter(
        (result) => result.createdAt > subDays(new Date(), 30),
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
