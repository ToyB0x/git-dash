import type { getWasmDb } from "@/clients";
import { generateDailyData } from "@/lib/generateDailyData";
import {
  billingCycleTbl,
  repositoryTbl,
  scanTbl,
  workflowTbl,
  workflowUsageCurrentCycleOrgTbl,
  workflowUsageCurrentCycleTbl,
} from "@git-dash/db";
import { startOfTomorrow, subDays } from "date-fns";
import { and, desc, eq, gte } from "drizzle-orm";

export const sampleWorkflows = [
  {
    repoName: "org/api",
    workflowName: "unit test",
    workflowPath: "test.yml",
    cost: 3509,
  },
  {
    repoName: "org/frontend",
    workflowName: "visual regression test",
    workflowPath: "ui-test.yml",
    cost: 5720,
  },
  {
    repoName: "org/payment",
    workflowName: "build",
    workflowPath: "build.yml",
    cost: 5720,
  },
  {
    repoName: "org/backend",
    workflowName: "unit test",
    workflowPath: "test.yml",
    cost: 4210,
  },
  {
    repoName: "org/serviceX",
    workflowName: "E2E test",
    workflowPath: "e2e.yml",
    cost: 2101,
  },
];

export const sampleActions = [
  {
    runnerType: "Actions 2Core",
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
    runnerType: "Actions 4Core",
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
    runnerType: "Actions 16Core",
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

export const loaderUsageByRunnerTypes = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const runnerTypes = await db
    .selectDistinct({ runnerType: workflowUsageCurrentCycleOrgTbl.runnerType })
    .from(workflowUsageCurrentCycleOrgTbl)
    .where(
      and(
        gte(
          workflowUsageCurrentCycleOrgTbl.updatedAt,
          subDays(startOfTomorrow(), 60),
        ),
        gte(workflowUsageCurrentCycleOrgTbl.dollar, 1),
      ),
    );

  const usageByRunnerTypes = await Promise.all(
    runnerTypes
      .sort((a, b) => a.runnerType.localeCompare(b.runnerType) || 0)
      .map(async ({ runnerType }) => ({
        runnerType: runnerType,
        data: await db
          .select()
          .from(workflowUsageCurrentCycleOrgTbl)
          .where(
            and(
              eq(workflowUsageCurrentCycleOrgTbl.runnerType, runnerType),
              gte(
                workflowUsageCurrentCycleOrgTbl.updatedAt,
                subDays(startOfTomorrow(), 60),
              ),
            ),
          )
          .orderBy(desc(workflowUsageCurrentCycleOrgTbl.updatedAt)),
      })),
  );

  return usageByRunnerTypes.map((usageByRunnerType) => {
    const usages = [...Array(60).keys()].map((_, i) => {
      const currentDate = subDays(startOfTomorrow(), i);
      const usage = usageByRunnerType.data.find(
        (usage) =>
          usage.day === currentDate.getDate() &&
          usage.month === currentDate.getMonth() + 1,
      );

      return {
        value: usage?.dollar || null,
        date: currentDate,
      };
    });

    return {
      runnerType: usageByRunnerType.runnerType,
      data: usages
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((usage, index, self) => {
          // 初日は前日比がないのでコストがわからない
          if (index === 0) {
            return { date: usage.date, value: null };
          }

          // 前日のコストがない場合も差分を計算できない
          const beforeDayCost = self[index - 1]?.value;
          const hasBeforeDayCost = !!beforeDayCost && beforeDayCost > 0;
          if (!hasBeforeDayCost) {
            return { date: usage.date, value: null };
          }

          // コストが前日よりも小さい場合は、新しい請求サイクルが始まったとみなす
          const hasResetBillingCycle = Number(usage.value) - beforeDayCost < 0;
          if (hasResetBillingCycle) {
            return { date: usage.date, value: usage.value };
          }
          return {
            date: usage.date,
            value:
              usage.value === null
                ? null // 見計測の未来はnull
                : usage.value - beforeDayCost,
          };
        }),
    };
  });
};
