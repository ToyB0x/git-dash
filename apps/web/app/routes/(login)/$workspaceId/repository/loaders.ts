import type { getWasmDb } from "@/clients";
import {
  prTbl,
  releaseTbl,
  repositoryTbl,
  reviewTbl,
  scanTbl,
  workflowUsageCurrentCycleTbl,
} from "@git-dash/db";
import { subDays } from "date-fns";
import { and, desc, eq, gte } from "drizzle-orm";

export const sampleRepositories = [
  {
    id: 1,
    name: "api",
    owner: "org",
    prs: 124,
    reviews: 21,
    releases: 16,
    cost: 3213,
    lastActivity: new Date(),
  },
  {
    id: 2,
    name: "frontend",
    owner: "org",
    prs: 91,
    reviews: 12,
    releases: 9,
    cost: 1213,
    lastActivity: new Date(),
  },
  {
    id: 3,
    name: "payment",
    owner: "org",
    prs: 61,
    reviews: 9,
    releases: 6,
    cost: 913,
    lastActivity: new Date(),
  },
  {
    id: 4,
    name: "backend",
    owner: "org",
    prs: 21,
    reviews: 3,
    releases: 2,
    cost: 541,
    lastActivity: new Date(),
  },
  {
    id: 5,
    name: "serviceX",
    owner: "org",
    prs: 6,
    reviews: 1,
    releases: 0,
    cost: 213,
    lastActivity: new Date(),
  },
  {
    id: 6,
    name: "serviceY",
    owner: "org",
    prs: 2,
    reviews: 1,
    releases: 0,
    cost: 113,
    lastActivity: new Date(),
  },
  {
    id: 7,
    name: "serviceZ",
    owner: "org",
    prs: 1,
    reviews: 1,
    releases: 0,
    cost: 86,
    lastActivity: new Date(),
  },
];

export const loaderRepositories = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const repos = await db.select().from(repositoryTbl);
  const latestScans = await db
    .select()
    .from(scanTbl)
    .orderBy(desc(scanTbl.createdAt))
    .limit(1);
  const lastScan = latestScans[0];

  return await Promise.all(
    repos.map(async (repo) => ({
      ...repo,
      prs: (
        await db
          .select()
          .from(prTbl)
          .where(
            and(
              eq(prTbl.repositoryId, repo.id),
              gte(prTbl.createdAt, subDays(new Date(), 30)),
            ),
          )
      ).length,
      reviews: (
        await db
          .select()
          .from(reviewTbl)
          .where(
            and(
              eq(reviewTbl.repositoryId, repo.id),
              gte(reviewTbl.createdAt, subDays(new Date(), 30)),
            ),
          )
      ).length,
      releases: (
        await db
          .select()
          .from(releaseTbl)
          .where(
            and(
              eq(releaseTbl.repositoryId, repo.id),
              gte(releaseTbl.publishedAt, subDays(new Date(), 30)),
            ),
          )
      ).length,
      cost: lastScan
        ? Math.round(
            10 *
              (
                await db
                  .select()
                  .from(workflowUsageCurrentCycleTbl)
                  .where(
                    and(
                      eq(workflowUsageCurrentCycleTbl.repositoryId, repo.id),
                      gte(
                        workflowUsageCurrentCycleTbl.updatedAt,
                        subDays(new Date(), 30),
                      ),
                      eq(workflowUsageCurrentCycleTbl.scanId, lastScan.id),
                    ),
                  )
              ).reduce((acc, cur) => acc + cur.dollar, 0),
          ) / 10
        : 0,
      lastActivity: repo.updatedAtGithub ?? repo.createdAt,
    })),
  );
};
