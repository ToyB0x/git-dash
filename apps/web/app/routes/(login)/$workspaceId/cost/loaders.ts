import type { getWasmDb } from "@/clients";
import { generateDailyData } from "@/lib/generateDailyData";
import {
  billingCycleTbl,
  repositoryTbl,
  scanTbl,
  workflowTbl,
  workflowUsageCurrentCycleTbl,
} from "@git-dash/db";
import { and, desc, eq, gte } from "drizzle-orm";

export const sampleActions = [
  {
    runnerType: "Actions2Core",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 12,
      max: 50,
      variance: 0.04,
      weekendReduction: false,
    }),
  },
  {
    runnerType: "Actions4Core",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 20,
      max: 40,
      variance: 0.01,
      weekendReduction: true,
    }),
  },
  {
    runnerType: "Actions16Core",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 30,
      max: 80,
      variance: 0.1,
      weekendReduction: true,
    }),
  },
];

export const loaderDaysInCurrentCycle = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const billing = await db
    .select()
    .from(billingCycleTbl)
    .orderBy(desc(billingCycleTbl.createdAt))
    .get();

  return billing?.daysLeft;
};

export const loaderWorkflowsCost = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const lastScan = await db
    .select()
    .from(scanTbl)
    .orderBy(desc(scanTbl.createdAt))
    .get();

  const workflows = lastScan
    ? await db
        .select({
          workflowId: workflowTbl.id,
          workflowName: workflowTbl.name,
          workflowPath: workflowTbl.path,
          dollar: workflowUsageCurrentCycleTbl.dollar,
          repositoryName: repositoryTbl.name,
        })
        .from(workflowUsageCurrentCycleTbl)
        .where(
          and(
            eq(workflowUsageCurrentCycleTbl.scanId, lastScan.id),
            gte(workflowUsageCurrentCycleTbl.dollar, 1),
          ),
        )
        .innerJoin(
          workflowTbl,
          eq(workflowUsageCurrentCycleTbl.workflowId, workflowTbl.id),
        )
        .innerJoin(
          repositoryTbl,
          eq(workflowTbl.repositoryId, repositoryTbl.id),
        )
    : null;

  return workflows
    ? workflows
        .map((workflow) => ({
          repoName: workflow.repositoryName,
          workflowName: workflow.workflowName,
          workflowPath: workflow.workflowPath,
          cost: workflow.dollar,
        }))
        .sort((a, b) => b.cost - a.cost)
    : [];
};
