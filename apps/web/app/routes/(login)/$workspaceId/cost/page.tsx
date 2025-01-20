import { auth, getWasmDb } from "@/clients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { NoDataMessage } from "@/components/ui/no-data";
import {
  loaderDaysInCurrentCycle,
  sampleActions,
} from "@/routes/(login)/$workspaceId/cost/loaders";
import type { Route } from "@@/(login)/$workspaceId/cost/+types/page";
import {
  repositoryTbl,
  scanTbl,
  workflowTbl,
  workflowUsageCurrentCycleOrgTbl,
  workflowUsageCurrentCycleTbl,
} from "@git-dash/db";
import { startOfTomorrow, subDays } from "date-fns";
import { and, desc, eq, gte } from "drizzle-orm";
import { Link, redirect } from "react-router";
import { Actions, Stats } from "./components";

export type KpiEntry = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
  unit?: string;
};

const dataTable = [
  {
    repoName: "org/api",
    workflowName: "unit test",
    workflowPath: "test.yml",
    cost: "3,509",
  },
  {
    repoName: "org/frontend",
    workflowName: "visual regression test",
    workflowPath: "ui-test.yml",
    cost: "5,720",
  },
  {
    repoName: "org/payment",
    workflowName: "build",
    workflowPath: "build.yml",
    cost: "5,720",
  },
  {
    repoName: "org/backend",
    workflowName: "unit test",
    workflowPath: "test.yml",
    cost: "4,210",
  },
  {
    repoName: "org/serviceX",
    workflowName: "E2E test",
    workflowPath: "e2e.yml",
    cost: "2,101",
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

  const lastScans = await wasmDb
    .select()
    .from(scanTbl)
    .orderBy(desc(scanTbl.createdAt))
    .limit(1);

  const lastScan = lastScans[0];

  const workflows = lastScan
    ? await wasmDb
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

  return {
    daysInCurrentCycle: await loaderDaysInCurrentCycle(wasmDb),
    workflows: workflows
      ? workflows
          .map((workflow) => ({
            repoName: workflow.repositoryName,
            workflowName: workflow.workflowName,
            workflowPath: workflow.workflowPath,
            cost: workflow.dollar,
          }))
          .sort((a, b) => b.cost - a.cost)
      : [],

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

      <section aria-labelledby="high-cost-actions">
        <h1
          id="high-cost-actions"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Expensive Actions (Current billing cycle)
        </h1>
        <p className="mt-1 text-gray-500">
          for more details, click on the repository links.
        </p>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>File</TableHeaderCell>
                {/*<TableHeaderCell>Time(min)</TableHeaderCell>*/}
                <TableHeaderCell className="text-right">Costs</TableHeaderCell>
                {/*<TableHeaderCell className="text-right">*/}
                {/*  Last run*/}
                {/*</TableHeaderCell>*/}
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.map((item) => (
                <TableRow key={item.repoName + item.workflowPath}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    <Link
                      to={`../repositories/${item.repoName}`}
                      className="underline underline-offset-4"
                    >
                      {item.repoName}
                    </Link>
                  </TableCell>
                  <TableCell>{item.workflowName}</TableCell>
                  <TableCell>
                    {item.workflowPath.replace(".github/workflows/", "")}
                  </TableCell>
                  {/*<TableCell>{item.time}</TableCell>*/}
                  <TableCell className="text-right">${item.cost}</TableCell>
                  {/*<TableCell className="text-right">{item.lastRun}</TableCell>*/}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>
    </>
  );
}
