import type { getWasmDb } from "@/clients";
import { alertTbl, repositoryTbl, scanTbl } from "@git-dash/db";
import { asc, desc, eq } from "drizzle-orm";

export type AlertData = {
  repositoryName: string;
  countCritical: number;
  countHigh: number;
  countMedium: number;
  countLow: number;
  lastDetected: Date | null;
  enabled: boolean | null;
};

export const sampleAlerts = [
  {
    repositoryName: "api",
    countCritical: 124,
    countHigh: 21,
    countMedium: 16,
    countLow: 16,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/frontend",
    countCritical: 91,
    countHigh: 12,
    countMedium: 9,
    countLow: 9,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/payment",
    countCritical: 61,
    countHigh: 9,
    countMedium: 6,
    countLow: 6,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/backend",
    countCritical: 21,
    countHigh: 3,
    countMedium: 2,
    countLow: 2,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/serviceX",
    countCritical: 6,
    countHigh: 1,
    countMedium: 1,
    countLow: 0,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/serviceY",
    countCritical: 0,
    countHigh: 0,
    countMedium: 0,
    countLow: 0,
    lastDetected: new Date(),
    enabled: false,
  },
  {
    repositoryName: "org/serviceZ",
    countCritical: 0,
    countHigh: 0,
    countMedium: 0,
    countLow: 0,
    lastDetected: new Date(),
    enabled: false,
  },
] satisfies AlertData[];

export const loaderRepositories = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => await db.select().from(repositoryTbl).orderBy(asc(repositoryTbl.name));

export const loaderAlerts = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const latestScans = await db
    .select()
    .from(scanTbl)
    .orderBy(desc(scanTbl.createdAt))
    .limit(1);
  const lastScan = latestScans[0];

  const alertsSummariesByRepo = lastScan
    ? await db.select().from(alertTbl).where(eq(alertTbl.scanId, lastScan.id))
    : [];

  return (await Promise.all(
    alertsSummariesByRepo.map(async (repository) => {
      const matchedRepos = await db
        .select()
        .from(repositoryTbl)
        .where(eq(repositoryTbl.id, repository.repositoryId))
        .limit(1);

      const repo = matchedRepos[0];
      if (!repo) throw Error("Repository not found");

      return {
        repositoryName: repo.name,
        countCritical: repository.countCritical,
        countHigh: repository.countHigh,
        countMedium: repository.countMedium,
        countLow: repository.countLow,
        lastDetected: repo.enabledAlertCheckedAt,
        enabled: repo.enabledAlert,
      };
    }),
  )) satisfies AlertData[];
};
