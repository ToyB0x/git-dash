import type { getWasmDb } from "@/clients";
import { renovateBotId } from "@/constants";
import {
  alertTbl,
  billingCycleTbl,
  prCommitTbl,
  prTbl,
  releaseTbl,
  repositoryTbl,
  scanTbl,
  userTbl,
  workflowUsageCurrentCycleOrgTbl,
} from "@git-dash/db";
import { endOfToday, subDays, subHours } from "date-fns";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  lt,
  not,
} from "drizzle-orm";
import type { ITimeEntry } from "react-time-heatmap";

export type StatCardData = {
  name: string;
  stat: string | number;
  change?: number | null;
  changeType?: "positive" | "negative";
};

export const sampleStats: StatCardData[] = [
  {
    name: "Pull requests / month",
    stat: "128",
    change: 3.6,
    changeType: "positive",
  },
  {
    name: "Releases / month",
    stat: "42",
    change: 12.5,
    changeType: "negative",
  },
  {
    name: "Change Failure Rate",
    stat: "1.9%",
    change: 0.4,
    changeType: "positive",
  },
  {
    name: "Vulnerabilities (critical)",
    stat: "29",
    change: 19.7,
    changeType: "negative",
  },
];

export const sampleHeatMaps: ITimeEntry[] = [...Array(24 * 60).keys()].map(
  (hour) => ({
    time: subHours(endOfToday(), hour),
    count:
      subHours(endOfToday(), hour).getDay() <= 1
        ? Math.floor(Math.random() * 1.2) // 週末は低頻度にする
        : // 早朝深夜は低頻度にする
          subHours(endOfToday(), hour).getHours() < 7 ||
            subHours(endOfToday(), hour).getHours() > 20
          ? Math.floor(Math.random() * 1.2)
          : // 平日の昼間は高頻度にする
            Math.floor(Math.random() * 5),
  }),
);

export const sampleWorkflowUsageOrg = [
  {
    runnerType: "Ubuntu 16 core",
    dollar: 6730,
  },
  {
    runnerType: "Ubuntu 2 core",
    dollar: 4120,
  },
  {
    runnerType: "Windows 8 core",
    dollar: 3920,
  },
  {
    runnerType: "Windows 32 core",
    dollar: 2120,
  },
];

export const sampleCosts = [
  { date: "1", value: Math.random() * 100 },
  { date: "2", value: Math.random() * 100 },
  { date: "3", value: Math.random() * 100 },
  { date: "4", value: Math.random() * 100 },
  { date: "5", value: Math.random() * 100 },
  { date: "6", value: Math.random() * 100 },
  { date: "7", value: Math.random() * 100 },
  { date: "8", value: Math.random() * 100 },
  { date: "9", value: Math.random() * 100 },
  { date: "10", value: Math.random() * 100 },
  { date: "11", value: Math.random() * 100 },
  { date: "12", value: Math.random() * 100 },
  { date: "13", value: Math.random() * 100 },
  { date: "14", value: Math.random() * 100 },
  { date: "15", value: Math.random() * 100 },
  { date: "16", value: Math.random() * 100 },
  { date: "17", value: Math.random() * 100 },
  { date: "18", value: Math.random() * 100 },
  { date: "19", value: Math.random() * 100 },
  { date: "20", value: Math.random() * 100 },
  { date: "21", value: Math.random() * 100 },
  { date: "22", value: Math.random() * 100 },
  { date: "23", value: Math.random() * 100 },
  { date: "24", value: Math.random() * 100 },
  { date: "25", value: Math.random() * 100 },
  { date: "26", value: Math.random() * 100 },
  { date: "27", value: Math.random() * 100 },
  { date: "28", value: Math.random() * 100 },
  { date: "29", value: Math.random() * 100 },
  { date: "30", value: Math.random() * 100 },
  { date: "31", value: Math.random() * 100 },
];

export const loaderStatPr = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
): Promise<StatCardData> => {
  const prCountLast30days = await db
    .select({ count: count() })
    .from(prTbl)
    .where(
      and(
        gte(prTbl.createdAt, subDays(new Date(), 30)),
        isNotNull(prTbl.mergedAt),
        not(eq(prTbl.authorId, renovateBotId)),
      ),
    );

  const prCountLastPeriod = await db
    .select({ count: count() })
    .from(prTbl)
    .where(
      and(
        gte(prTbl.createdAt, subDays(new Date(), 60)),
        lt(prTbl.createdAt, subDays(new Date(), 30)),
        isNotNull(prTbl.mergedAt),
        not(eq(prTbl.authorId, renovateBotId)),
      ),
    );

  return {
    name: "Pull requests / month",
    stat: (prCountLast30days[0]?.count || 0).toString(),
    change:
      Math.round(
        ((prCountLast30days[0]?.count || 0) /
          (prCountLastPeriod[0]?.count || 0)) *
          10,
      ) / 10,
    changeType:
      (prCountLast30days[0]?.count || 0) > (prCountLastPeriod[0]?.count || 0)
        ? "positive"
        : "negative",
  };
};

export const loaderStatRelease = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
): Promise<StatCardData> => {
  const releaseCountLast30days = await db
    .select({ count: count() })
    .from(releaseTbl)
    .where(and(gte(releaseTbl.publishedAt, subDays(new Date(), 30))));

  const releaseCountLastPeriod = await db
    .select({ count: count() })
    .from(releaseTbl)
    .where(
      and(
        gte(releaseTbl.publishedAt, subDays(new Date(), 60)),
        lt(releaseTbl.publishedAt, subDays(new Date(), 30)),
      ),
    );

  return {
    name: "Releases / month",
    stat: (releaseCountLast30days[0]?.count || 0).toString(),
    change:
      Math.round(
        ((releaseCountLast30days[0]?.count || 0) /
          (releaseCountLastPeriod[0]?.count || 0)) *
          10,
      ) / 10,
    changeType:
      (releaseCountLast30days[0]?.count || 0) >
      (releaseCountLastPeriod[0]?.count || 0)
        ? "positive"
        : "negative",
  };
};

export const loaderStatVuln = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
): Promise<StatCardData> => {
  const latestScan = await db
    .select()
    .from(scanTbl)
    .orderBy(desc(scanTbl.updatedAt))
    .limit(1);
  const latestScanId = latestScan[0]?.id;
  if (!latestScanId) {
    return {
      name: "Vulnerabilities (critical)",
      stat: "-",
    };
  }

  const alertsToday = await db
    .select()
    .from(alertTbl)
    .where(eq(alertTbl.scanId, latestScanId));

  const scan30DayAgo = await db
    .select()
    .from(scanTbl)
    .where(
      and(
        gte(scanTbl.updatedAt, subDays(new Date(), 30)),
        lt(scanTbl.updatedAt, subDays(new Date(), 29)),
      ),
    )
    .orderBy(desc(scanTbl.updatedAt))
    .limit(1);

  const scan30DayAgoId = scan30DayAgo[0]?.id;

  const alerts30DayAgo = scan30DayAgoId
    ? await db
        .select()
        .from(alertTbl)
        .where(and(eq(alertTbl.scanId, scan30DayAgoId)))
    : [];

  const criticalAlertsToday = alertsToday.reduce(
    (acc, item) => item.countCritical + acc,
    0,
  );

  const criticalAlerts30DayAgo = alerts30DayAgo.reduce(
    (acc, item) => item.countCritical + acc,
    0,
  );

  return {
    name: "Vulnerabilities (critical)",
    stat: criticalAlertsToday,
    change:
      criticalAlerts30DayAgo !== 0
        ? (Math.round(criticalAlertsToday - criticalAlerts30DayAgo * 10) / 10) *
          100
        : null,
    changeType:
      criticalAlertsToday - criticalAlerts30DayAgo > 0
        ? "positive"
        : "negative",
  };
};

export const loaderReleases = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  return await db
    .select({
      id: releaseTbl.id,
      title: releaseTbl.title,
      body: releaseTbl.body,
      publishedAt: releaseTbl.publishedAt,
      repositoryId: releaseTbl.repositoryId,
      repositoryName: repositoryTbl.name,
      releaseUrl: releaseTbl.url,
      authorId: releaseTbl.authorId,
      authorName: userTbl.name,
      authorAvatarUrl: userTbl.avatarUrl,
    })
    .from(releaseTbl)
    .leftJoin(repositoryTbl, eq(releaseTbl.repositoryId, repositoryTbl.id))
    .leftJoin(userTbl, eq(releaseTbl.authorId, userTbl.id))
    .orderBy(desc(releaseTbl.publishedAt))
    .limit(5);
};

export const loaderWorkflowUsageCurrentCycleOrg = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const workflowUsageCurrentCycleOrg = await db
    .select()
    .from(workflowUsageCurrentCycleOrgTbl)
    // NOTE: 今日の集計結果があるとは限らないためWhere句を削除
    // .where(
    //   and(
    //     gte(workflowUsageCurrentCycleOrgTbl.year, now.getUTCFullYear()),
    //     gte(workflowUsageCurrentCycleOrgTbl.month, now.getUTCMonth() + 1),
    //     gte(workflowUsageCurrentCycleOrgTbl.day, now.getUTCDate()),
    //   ),
    // )
    .orderBy(desc(workflowUsageCurrentCycleOrgTbl.updatedAt))
    .limit(100); // limit today 1 * 100 runnerType

  // 最新の集計結果だけにフィルタリング
  return workflowUsageCurrentCycleOrg.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.runnerType === item.runnerType),
  );
};

export const loaderCosts = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const now = new Date();
  const dailyWorkflowUsageOrgCurrentMonth = await db
    .select()
    .from(workflowUsageCurrentCycleOrgTbl)
    .where(gte(workflowUsageCurrentCycleOrgTbl.createdAt, subDays(now, 30)))
    .orderBy(asc(workflowUsageCurrentCycleOrgTbl.createdAt));

  const data = [...Array(31).keys()]
    .map((dayBefore) => {
      const targetDate = subDays(now, dayBefore);
      const matchedData = dailyWorkflowUsageOrgCurrentMonth.filter(
        (run) => run.day === targetDate.getDate(),
      );

      return {
        date: targetDate.getDate(),
        value: matchedData.length
          ? matchedData.reduce((acc, run) => acc + run.dollar, 0)
          : null,
      };
    })
    .reverse();

  return data.map((item, index, self) => {
    // 前日のコストがない場合は差分を計算できない
    const beforeDayCost = self[index - 1]?.value;
    if (beforeDayCost === null) {
      return { ...item, value: null };
    }

    const hasBeforeDayCost = beforeDayCost !== undefined && beforeDayCost > 0;
    if (!hasBeforeDayCost) {
      return { ...item, value: null };
    }

    // コストがない場合は差分を計算できない
    if (item.value === null) {
      return { ...item, value: null };
    }

    // コストが前日よりも小さい場合は、新しい請求サイクルが始まったとみなす
    const hasResetBillingCycle = item.value - beforeDayCost < 0;
    if (hasResetBillingCycle) {
      return { ...item, value: item.value };
    }
    return { ...item, value: item.value - beforeDayCost };
  });
};

export const loaderHeatMaps = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
): Promise<ITimeEntry[]> => {
  return await Promise.all(
    [...Array(24 * 60).keys()].map(async (hour) => ({
      time: subHours(endOfToday(), hour),
      count:
        ((
          await db
            .select({ count: count() })
            .from(prCommitTbl)
            .where(
              and(
                gte(prCommitTbl.commitAt, subHours(endOfToday(), hour)),
                lt(prCommitTbl.commitAt, subHours(endOfToday(), hour - 1)),
                not(eq(prCommitTbl.authorId, renovateBotId)),
              ),
            )
        )[0]?.count || 0) +
        ((
          await db
            .select({ count: count() })
            .from(prTbl)
            .where(
              and(
                gte(prTbl.createdAt, subHours(endOfToday(), hour)),
                lt(prTbl.createdAt, subHours(endOfToday(), hour - 1)),
                not(eq(prTbl.authorId, renovateBotId)),
              ),
            )
        )[0]?.count || 0),
    })),
  );
};

export const loaderDaysInCurrentCycle = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  return (
    await db
      .select()
      .from(billingCycleTbl)
      .orderBy(desc(billingCycleTbl.createdAt))
      .limit(1)
  )[0]?.daysLeft;
};
