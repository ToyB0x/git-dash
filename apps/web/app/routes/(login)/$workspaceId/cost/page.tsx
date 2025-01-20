import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import { ActionsTable } from "@/routes/(login)/$workspaceId/cost/components/table";
import {
  loaderDaysInCurrentCycle,
  loaderWorkflowsCost,
  sampleActions,
} from "@/routes/(login)/$workspaceId/cost/loaders";
import type { Route } from "@@/(login)/$workspaceId/cost/+types/page";
import { workflowUsageCurrentCycleOrgTbl } from "@git-dash/db";
import { startOfTomorrow, subDays } from "date-fns";
import { and, desc, eq, gte } from "drizzle-orm";
import { redirect } from "react-router";
import { Actions, Stats } from "./components";

const dataTable = [
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

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      workflows: dataTable,
      usageByRunnerTypes: sampleActions,
      daysInCurrentCycle: 21,
    };
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: await auth.currentUser.getIdToken(),
  });

  if (!wasmDb) return null;

  const runnerTypes = await wasmDb
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
        data: await wasmDb
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

  return {
    daysInCurrentCycle: await loaderDaysInCurrentCycle(wasmDb),
    workflows: await loaderWorkflowsCost(wasmDb),

    usageByRunnerTypes: usageByRunnerTypes.map((usageByRunnerType) => {
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
            const hasResetBillingCycle =
              Number(usage.value) - beforeDayCost < 0;
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
    }),
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { workflows, usageByRunnerTypes, daysInCurrentCycle } = loadData;

  return (
    <>
      {daysInCurrentCycle && <Stats daysInCurrentCycle={daysInCurrentCycle} />}

      <Actions usageByRunnerTypes={usageByRunnerTypes} />

      <ActionsTable workflows={workflows} />
    </>
  );
}
