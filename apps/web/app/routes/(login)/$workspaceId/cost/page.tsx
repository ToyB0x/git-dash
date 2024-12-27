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
import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { ProgressBarCard } from "@/components/ui/overview/DashboardProgressBarCard";
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
  workflowUsageCurrentCycleTbl,
} from "@repo/db-shared";
import { startOfToday, subDays } from "date-fns";
import { desc, eq } from "drizzle-orm";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Link, redirect } from "react-router";

export type KpiEntry = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
  unit?: string;
};

const data: KpiEntry[] = [
  {
    title: "Seats",
    percentage: 98.1,
    current: 119,
    allowed: 121,
    unit: "seats",
  },
  {
    title: "Actions (included)",
    percentage: 100,
    current: 3000,
    allowed: 3000,
    unit: "min",
  },
  {
    title: "Storage",
    percentage: 26,
    current: 0.8,
    allowed: 2,
    unit: "GB",
  },
];

export type KpiEntryExtended = Omit<
  KpiEntry,
  "current" | "allowed" | "unit"
> & {
  value: string;
  color: string;
};

const data2: KpiEntryExtended[] = [
  {
    title: "Actions",
    percentage: 50.8,
    value: "$1961.1",
    color: "bg-red-600 dark:bg-red-500",
  },
  {
    title: "Seats",
    percentage: 28.1,
    value: "$200",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "Copilot",
    percentage: 16.1,
    value: "$391.9",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "Others",
    percentage: 5,
    value: "$31.9",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const data3: KpiEntryExtended[] = [
  {
    title: "Ubuntu 16-core",
    percentage: 63.8,
    value: "$1221.1",
    color: "bg-red-600 dark:bg-red-500",
  },
  {
    title: "Ubuntu 2-core",
    percentage: 18.1,
    value: "$202",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "Ubuntu 4-core",
    percentage: 16.1,
    value: "$21.9",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "Others",
    percentage: 5,
    value: "$3.9",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const dataTable = [
  {
    repoName: "org/api",
    workflowName: "unit test",
    workflowPath: "test.yml",
    cost: "$3,509",
  },
  {
    repoName: "org/frontend",
    workflowName: "visual regression test",
    workflowPath: "ui-test.yml",
    cost: "$5,720",
  },
  {
    repoName: "org/payment",
    workflowName: "build",
    workflowPath: "build.yml",
    cost: "$5,720",
  },
  {
    repoName: "org/backend",
    workflowName: "unit test",
    workflowPath: "test.yml",
    cost: "$4,210",
  },
  {
    repoName: "org/serviceX",
    workflowName: "E2E test",
    workflowPath: "e2e.yml",
    cost: "$2,101",
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

  const workflows = await wasmDb
    .select({
      workflowId: workflowTbl.id,
      workflowName: workflowTbl.name,
      workflowPath: workflowTbl.path,
      dollar: workflowUsageCurrentCycleTbl.dollar,
      repositoryName: repositoryTbl.name,
    })
    .from(workflowUsageCurrentCycleTbl)
    .orderBy(desc(workflowUsageCurrentCycleTbl.dollar))
    .innerJoin(workflowTbl, eq(workflowUsageCurrentCycleTbl.id, workflowTbl.id))
    .innerJoin(repositoryTbl, eq(workflowTbl.repositoryId, repositoryTbl.id))
    .limit(30);

  return {
    dataActions2Core,
    dataActions4Core,
    dataActions16Core,
    workflows: workflows.map((workflow) => ({
      repoName: workflow.repositoryName,
      workflowName: workflow.workflowName,
      workflowPath: workflow.workflowPath,
      cost: workflow.dollar,
    })),
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { dataActions2Core, dataActions4Core, dataActions16Core, workflows } =
    loadData;

  const maxDate = startOfToday();
  const [selectedDates, setSelectedDates] = React.useState<
    DateRange | undefined
  >({
    from: subDays(maxDate, 30),
    to: maxDate,
  });

  return (
    <>
      <section aria-labelledby="current-billing-cycle">
        <h1
          id="current-billing-cycle"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Current billing cycle
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <ProgressBarCard
            title="Usage"
            change="+0.2%"
            value="96.1%"
            valueDescription="of reserved seats"
            ctaDescription="Monthly usage resets in 12 days."
            ctaText="Manage plan."
            ctaLink="#"
            data={data}
          />
          <CategoryBarCard
            title="Costs"
            change="-1.4%"
            value="$3293.5"
            valueDescription="current billing cycle"
            subtitle="Current costs"
            ctaDescription="Next payment due"
            ctaText="December 31, 2024"
            ctaLink="#"
            data={data2}
          />
          <CategoryBarCard
            title="Actions"
            change="+9.4%"
            value="$1889.5"
            valueDescription="current billing cycle"
            subtitle="Current costs"
            ctaDescription="Next payment due"
            ctaText="December 31, 2024"
            ctaLink="#"
            data={data3}
          />
        </div>
      </section>
      <section aria-labelledby="actions-usage">
        <h1
          id="actions-usage"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Actions usage
        </h1>
        <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
          <Filterbar
            maxDate={maxDate}
            minDate={new Date(2024, 0, 1)}
            selectedDates={selectedDates}
            onDatesChange={(dates) => setSelectedDates(dates)}
          />
        </div>
        <dl
          className={cx(
            "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          <ChartCard
            title="Actions 2core"
            type="currency"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataActions2Core.data}
          />

          <ChartCard
            title="Actions 4core"
            type="currency"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataActions4Core.data}
          />

          <ChartCard
            title="Actions 16core"
            type="currency"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataActions16Core.data}
          />
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
