import type { getWasmDb } from "@/clients";
import { prTbl, releaseTbl, repositoryTbl } from "@git-dash/db";
import { subDays } from "date-fns";
import { and, asc, eq, gte } from "drizzle-orm";

export const sampleFourKeys = [
  {
    name: "api",
    releases: 124,
    changeLeadTime: 1,
    changeFailureRate: 0.2,
    failedDeploymentRecoveryTime: 1,
  },
  {
    name: "frontend",
    releases: 91,
    changeLeadTime: 2,
    changeFailureRate: 1.1,
    failedDeploymentRecoveryTime: 3,
  },
  {
    name: "payment",
    releases: 61,
    changeLeadTime: 9,
    changeFailureRate: 3.2,
    failedDeploymentRecoveryTime: 6,
  },
  {
    name: "backend",
    releases: 21,
    changeLeadTime: 3,
    changeFailureRate: 0.6,
    failedDeploymentRecoveryTime: 9,
  },
  {
    name: "serviceX",
    releases: 6,
    changeLeadTime: 11,
    changeFailureRate: 0.1,
    failedDeploymentRecoveryTime: 11,
  },
  {
    name: "serviceY",
    releases: 2,
    changeLeadTime: 21,
    changeFailureRate: 0.8,
    failedDeploymentRecoveryTime: 8,
  },
  {
    name: "serviceZ",
    releases: 1,
    changeLeadTime: 17,
    changeFailureRate: 0.9,
    failedDeploymentRecoveryTime: 12,
  },
];

export const loaderFourKeys = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const repos = db.select().from(repositoryTbl).all();
  const releases = db
    .select()
    .from(releaseTbl)
    .where(gte(releaseTbl.publishedAt, subDays(new Date(), 30)))
    .orderBy(asc(releaseTbl.publishedAt))
    .all();

  return await Promise.all(
    repos.map(async (repo) => {
      const matchedReleases = releases.filter(
        (release) => repo.id === release.repositoryId,
      );

      const matchedPrs = await db
        .select()
        .from(prTbl)
        .where(
          and(
            eq(prTbl.repositoryId, repo.id),
            gte(prTbl.mergedAt, subDays(new Date(), 30)),
          ),
        )
        .orderBy(asc(prTbl.mergedAt))
        .all();

      const leadTimes = matchedPrs.map((pr) => {
        const mostClosestRelease = matchedReleases.find(
          (release) =>
            release.publishedAt &&
            pr.mergedAt &&
            release.publishedAt > pr.mergedAt,
        );

        if (!mostClosestRelease) return null;

        return (
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          mostClosestRelease.publishedAt!.getTime() - pr.mergedAt!.getTime()
        );
      });

      const countableLeadTimes = leadTimes.filter(
        (leadTime): leadTime is NonNullable<typeof leadTime> =>
          leadTime !== null,
      );

      const averageLeadTime =
        countableLeadTimes.reduce((acc, leadTime) => acc + leadTime, 0) /
        countableLeadTimes.length;

      return {
        name: repo.name,
        releases: matchedReleases.length,
        changeLeadTime:
          Math.round((10 * averageLeadTime) / (1000 * 60 * 60 * 24)) / 10, // days
        changeFailureRate: 0,
        failedDeploymentRecoveryTime: 0,
      };
    }),
  );
};
