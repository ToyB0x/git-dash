import type { getWasmDb } from "@/clients";
import { renovateBotId } from "@/constants";
import { alertTbl, prTbl, releaseTbl, scanTbl } from "@git-dash/db";
import { subDays } from "date-fns";
import { and, count, desc, eq, gte, isNotNull, lt, not } from "drizzle-orm";

export type StatCardData = {
  name: string;
  stat: string | number;
  change?: number | null;
  changeType?: "positive" | "negative";
};

export const sampleData: StatCardData[] = [
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
