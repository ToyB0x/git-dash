import { generateDailyData } from "@/lib/generateDailyData";
import { prTbl } from "@repo/db-shared";
import { subDays } from "date-fns";
import { and, eq, gte, isNotNull } from "drizzle-orm";
import type { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

type GraphData = {
  version: "0.1";
  type: "PrOpen" | "PrMerge" | "Reviews";
  data: {
    date: Date;
    value: number;
  }[];
};

export const dataLoaderPrOpen = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "PrOpen",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 5,
      variance: 1,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderPrMerge = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "PrMerge",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 5,
      variance: 1,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderReviews = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Reviews",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 15,
      variance: 1,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderTimeToMerge = async (
  db: DrizzleSqliteDODatabase,
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
    .filter((pr) => pr.createdAt > subDays(new Date(), 30))
    .reduce((acc, pr) => acc + pr.elapsedMsec, 0);
  const averageIn30Days = Math.round(sumIn30Days / mergedPrsWithMsec.length);

  const sumInPrevSpan = mergedPrsWithMsec
    .filter(
      (pr) =>
        pr.createdAt <= subDays(new Date(), 30) &&
        pr.createdAt > subDays(new Date(), 60),
    )
    .reduce((acc, pr) => acc + pr.elapsedMsec, 0);
  const averageInPrevSpan = Math.round(
    sumInPrevSpan / mergedPrsWithMsec.length,
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
      mergedPrsWithMsec.filter(
        (msec) =>
          msec.elapsedMsec >= base.diffStart && msec.elapsedMsec < base.diffEnd,
      ).length
    } PRs`,
    percentage:
      Math.round(
        10 *
          (mergedPrsWithMsec.filter(
            (msec) =>
              msec.elapsedMsec >= base.diffStart &&
              msec.elapsedMsec < base.diffEnd,
          ).length /
            mergedPrsWithMsec.length) *
          100,
      ) / 10,
  }));

  return {
    averageIn30Days,
    averageInPrevSpan,
    improvePercentage:
      (averageInPrevSpan - averageIn30Days > 0 ? "+" : "-") +
      Math.round(
        ((averageInPrevSpan - averageIn30Days) / averageInPrevSpan) * 100,
      ),
    bars,
  };
};
