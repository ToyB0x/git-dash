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
import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { cx } from "@/lib/utils";
import {
  dataLoaderActions2Core,
  dataLoaderActions4Core,
  dataLoaderActions16Core,
} from "@/routes/(login)/$workspaceId/cost/dataLoaders";
import type { Route } from "@@/(login)/$workspaceId/cost/+types/page";
import {
  repositoryTbl,
  workflowTbl,
  workflowUsageCurrentCycleOrgTbl,
  workflowUsageCurrentCycleTbl,
} from "@repo/db-shared";
import { endOfToday, startOfToday, subDays } from "date-fns";
import { and, desc, eq, gt, gte } from "drizzle-orm";
import { Link, redirect } from "react-router";

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
  const dataActions2Core = await dataLoaderActions2Core(true);
  const dataActions4Core = await dataLoaderActions4Core(true);
  const dataActions16Core = await dataLoaderActions16Core(true);

  if (params.workspaceId === "demo") {
    return {
      dataActions2Core,
      dataActions4Core,
      dataActions16Core,
      workflows: dataTable,
      usageByRunnerTypes: [],
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
          subDays(startOfToday(), 60),
        ),
        gte(workflowUsageCurrentCycleOrgTbl.dollar, 1),
      ),
    );

  const sixtyDays = [...Array(60).keys()].map((index) => {
    return index + 1;
  });

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
                subDays(startOfToday(), 60),
              ),
            ),
          )
          .orderBy(desc(workflowUsageCurrentCycleOrgTbl.updatedAt)),
      })),
  );

  const workflows = await wasmDb
    .select({
      workflowId: workflowTbl.id,
      workflowName: workflowTbl.name,
      workflowPath: workflowTbl.path,
      dollar: workflowUsageCurrentCycleTbl.dollar,
      repositoryName: repositoryTbl.name,
    })
    .from(workflowUsageCurrentCycleTbl)
    .orderBy(desc(workflowUsageCurrentCycleTbl.createdAt))
    .innerJoin(
      workflowTbl,
      eq(workflowUsageCurrentCycleTbl.workflowId, workflowTbl.id),
    )
    .innerJoin(repositoryTbl, eq(workflowTbl.repositoryId, repositoryTbl.id))
    .where(gt(workflowUsageCurrentCycleTbl.dollar, 5));

  return {
    dataActions2Core,
    dataActions4Core,
    dataActions16Core,
    workflows: workflows
      .map((workflow) => ({
        repoName: workflow.repositoryName,
        workflowName: workflow.workflowName,
        workflowPath: workflow.workflowPath,
        cost: workflow.dollar,
      }))
      .sort((a, b) => b.cost - a.cost),

    usageByRunnerTypes: usageByRunnerTypes.map((usageByRunnerType) => {
      const usages = sixtyDays.map((day) => {
        const usage = usageByRunnerType.data.find(
          (usage) =>
            new Date(usage.createdAt).getDate() ===
              subDays(startOfToday(), day - 1).getDate() &&
            new Date(usage.createdAt).getMonth() ===
              subDays(startOfToday(), day - 1).getMonth(),
        );

        return {
          value: usage?.dollar || null,
          date: subDays(endOfToday(), day),
        };
      });

      return {
        runnerType: usageByRunnerType.runnerType,
        data: usages
          .map((usage, i, self) => ({
            ...usage,
            value: usage.value
              ? usage.value - (self[i - 1]?.value || 0) > 0
                ? usage.value - (self[i - 1]?.value || 0)
                : usage.value // 前日比がマイナスになる場合は集計期間がリセットされた境目なので差し引きは不要
              : null, // 集計データがない場合はnull
          }))
          .slice(1, -1), // 最初の2件と最後の2件は前日比を出せないため除外(課金サイクルの境目を避けた場合、最低3日分の集計が必要),
      };
    }),
  };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const isDemo = params.workspaceId === "demo";

  const {
    dataActions2Core,
    dataActions4Core,
    dataActions16Core,
    workflows,
    usageByRunnerTypes,
  } = loadData;

  const endDate = subDays(startOfToday(), 2); // 最初の2件と最後の2件は前日比を出せないため除外(課金サイクルの境目を避けた場合、最低3日分の集計が必要)
  const span = {
    from: subDays(endDate, 30),
    to: endDate,
  };

  return (
    <>
      <section aria-labelledby="actions-usage">
        <h1
          id="actions-usage"
          className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Actions usage{" "}
          {!isDemo && (
            <span className="text-gray-500 text-sm">
              Based on billing cycle
            </span>
          )}
        </h1>
        <dl
          className={cx(
            "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {isDemo ? (
            <>
              <ChartCard
                title="Actions 2core"
                type="currency"
                selectedPeriod="last-year"
                selectedDates={span}
                data={dataActions2Core.data}
              />

              <ChartCard
                title="Actions 4core"
                type="currency"
                selectedPeriod="last-year"
                selectedDates={span}
                data={dataActions4Core.data}
              />

              <ChartCard
                title="Actions 16core"
                type="currency"
                selectedPeriod="last-year"
                selectedDates={span}
                data={dataActions16Core.data}
              />
            </>
          ) : (
            usageByRunnerTypes.map((usageByRunnerType) => (
              <ChartCard
                key={usageByRunnerType.runnerType}
                title={usageByRunnerType.runnerType
                  .toUpperCase()
                  .replaceAll("_", " ")}
                type="currency"
                selectedPeriod="no-comparison"
                selectedDates={span}
                accumulation={false}
                data={usageByRunnerType.data}
              />
            ))
          )}
        </dl>
      </section>

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
