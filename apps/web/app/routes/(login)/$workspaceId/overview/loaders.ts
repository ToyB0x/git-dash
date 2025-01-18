import type { getWasmDb } from "@/clients";
import { releaseTbl } from "@git-dash/db";
import { subDays } from "date-fns";
import { and, count, gte, lt } from "drizzle-orm";

export type StatCardData = {
  name: string;
  stat: string | number;
  change?: number | null;
  changeType?: "positive" | "negative";
};

export const sampleData: StatCardData[] = [
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
