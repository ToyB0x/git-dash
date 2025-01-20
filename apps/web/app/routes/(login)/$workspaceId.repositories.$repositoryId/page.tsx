import { auth, getWasmDb } from "@/clients";
import { Card } from "@/components/Card";
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
import { cx } from "@/lib/utils";
import { sampleActions } from "@/routes/(login)/$workspaceId/cost/loaders";
import type { Route } from "@@/(login)/$workspaceId.repositories.$repositoryId/+types/page";
import {
  prCommitTbl,
  repositoryTbl,
  reviewTbl,
  workflowTbl,
  workflowUsageCurrentCycleTbl,
} from "@git-dash/db";
import { endOfToday, startOfToday, subDays, subHours } from "date-fns";
import { and, count, desc, eq, gte, lt } from "drizzle-orm";
import React, { type ReactNode, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { redirect, useParams } from "react-router";
import type { ITimeEntry } from "react-time-heatmap";
import { dataLoaderTimeToMerge, dataLoaderTimeToReview } from "./dataLoaders";
import {
  dataLoaderChangeFailureRate,
  dataLoaderChangeLeadTime,
  dataLoaderFailedDeploymentRecoveryTime,
  dataLoaderRelease,
  dataLoaderTimeToReviewed,
} from "./dataLoaders";

type KpiEntry = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
  unit?: string;
};

type KpiEntryExtended = Omit<KpiEntry, "current" | "allowed" | "unit"> & {
  value: string;
  color: string;
};

// TODO: リポジトリページにActionsのコストグラフを出す
const data: KpiEntryExtended[] = [
  {
    title: "~1 day",
    percentage: 11.2,
    value: "43 PRs",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "2~7 days",
    percentage: 21.2,
    value: "93 PRs",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "8~14 days",
    percentage: 41.2,
    value: "121 PRs",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "15~ days",
    percentage: 29.1,
    value: "52 PRs",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const data2: KpiEntryExtended[] = [
  {
    title: "0.5 day",
    percentage: 15.4,
    value: "33 PRs",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "0.6~1 day",
    percentage: 51.2,
    value: "73 PRs",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "2~3 days",
    percentage: 11.2,
    value: "16 PRs",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "4~ days",
    percentage: 21.1,
    value: "41 PRs",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const data3: KpiEntryExtended[] = [
  {
    title: "0.5 day",
    percentage: 17.4,
    value: "35 PRs",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "0.6~1 day",
    percentage: 61.2,
    value: "83 PRs",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "2~3 days",
    percentage: 4.2,
    value: "8 PRs",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "4~ days",
    percentage: 3.1,
    value: "3 PRs",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const workflowUsageCurrentCyclesDemo = [
  {
    workflowId: 1,
    workflowName: "unit test",
    dollar: "1,509.21",
    workflowPath: "unit.yml",
  },
  {
    workflowId: 2,
    workflowName: "visual regression test",
    dollar: "720.42",
    workflowPath: "visual-regression.yml",
  },
  {
    workflowId: 3,
    workflowName: "build",
    dollar: "532.20",
    workflowPath: "build.yml",
  },
  {
    workflowId: 4,
    workflowName: "type check",
    dollar: "341.01",
    workflowPath: "typecheck.yml",
  },
  {
    workflowId: 5,
    workflowName: "E2E test",
    dollar: "21.10",
    workflowPath: "e2e.yml",
  },
];

const demoEntries: ITimeEntry[] = [...Array(24 * 60).keys()].map((hour) => ({
  time: subHours(endOfToday(), hour),
  count:
    subHours(endOfToday(), hour).getDay() <= 1
      ? Math.floor(Math.random() * 1.1) // 週末は低頻度にする
      : // 早朝深夜は低頻度にする
        subHours(endOfToday(), hour).getHours() < 8 ||
          subHours(endOfToday(), hour).getHours() > 20
        ? Math.floor(Math.random() * 1.2)
        : // 平日の昼間は高頻度にする
          Math.floor(Math.random() * 4),
}));

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  const isDemo = params.workspaceId === "demo";

  const dataChangeFailureRate = await dataLoaderChangeFailureRate(isDemo);
  const dataFailedDeploymentRecoveryTime =
    await dataLoaderFailedDeploymentRecoveryTime(isDemo);

  // const dataVulnerabilityCritical =
  //   await dataLoaderVulnerabilityCritical(isDemo);
  // const dataVulnerabilityHigh = await dataLoaderVulnerabilityHigh(isDemo);
  // const dataVulnerabilityLow = await dataLoaderVulnerabilityLow(isDemo);

  if (isDemo) {
    return {
      entries: demoEntries,
      dataChangeLeadTime: await dataLoaderChangeLeadTime({ isDemo }),
      dataRelease: await dataLoaderRelease({ isDemo }),
      dataChangeFailureRate,
      dataFailedDeploymentRecoveryTime,
      workflowUsageCurrentCycles: workflowUsageCurrentCyclesDemo,
      usageByWorkflowsDaily: sampleActions.map((action) => ({
        usageByWorkflowName: action.runnerType,
        ...action,
      })),
    };
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const token = await auth.currentUser.getIdToken();

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: token,
  });

  if (!wasmDb) return null;

  const repos = await wasmDb
    .select()
    .from(repositoryTbl)
    .where(eq(repositoryTbl.name, params.repositoryId));

  const repositoryId = repos[0]?.id;
  if (!repositoryId) return null;

  // ワークフローの日々の集計結果を取得
  const workflowUsageCurrentCyclesDaily = await wasmDb
    .select()
    .from(workflowUsageCurrentCycleTbl)
    .where(
      and(
        gte(
          workflowUsageCurrentCycleTbl.createdAt,
          subDays(startOfToday(), 60),
        ),
        eq(workflowUsageCurrentCycleTbl.repositoryId, repositoryId),
      ),
    );

  const repoWorkflows = await wasmDb
    .select()
    .from(workflowTbl)
    .where(eq(workflowTbl.repositoryId, repositoryId));

  // ワークフローの最新の集計結果を取得
  const workflowUsageCurrentCycles = await wasmDb
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
      eq(workflowTbl.id, workflowUsageCurrentCycleTbl.workflowId),
    )
    .innerJoin(repositoryTbl, eq(workflowTbl.repositoryId, repositoryTbl.id))
    .where(eq(repositoryTbl.id, repositoryId));

  // 最新の集計結果だけにフィルタリング
  const workflowUsageCurrentCyclesFiltered = workflowUsageCurrentCycles.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.workflowId === item.workflowId),
  );

  const entries: ITimeEntry[] = await Promise.all(
    [...Array(24 * 60).keys()].map(async (hour) => ({
      time: subHours(endOfToday(), hour),
      count:
        ((
          await wasmDb
            .select({ count: count() })
            .from(prCommitTbl)
            .where(
              and(
                eq(prCommitTbl.repositoryId, repositoryId),
                gte(prCommitTbl.commitAt, subHours(endOfToday(), hour)),
                lt(prCommitTbl.commitAt, subHours(endOfToday(), hour - 1)),
              ),
            )
        )[0]?.count || 0) +
        ((
          await wasmDb
            .select({ count: count() })
            .from(reviewTbl)
            .where(
              and(
                eq(reviewTbl.repositoryId, repositoryId),
                gte(reviewTbl.createdAt, subHours(endOfToday(), hour)),
                lt(reviewTbl.createdAt, subHours(endOfToday(), hour - 1)),
              ),
            )
        )[0]?.count || 0),
    })),
  );

  const timeToMerge = await dataLoaderTimeToMerge(wasmDb, repositoryId);
  const timeToReview = await dataLoaderTimeToReview(wasmDb, repositoryId);
  const timeToReviewed = await dataLoaderTimeToReviewed(wasmDb, repositoryId);

  // NOTE: workflowUsageCurrentCycleTblはある日のある時間の集計結果の断片でしかないため、例えば半日分の集計しかできていないことがあり、結果として1ヶ月で2倍のズレが出ることがあるので使わない
  // const workflowIds = await wasmDb
  //   .selectDistinct({ workflowId: workflowUsageCurrentCycleTbl.workflowId })
  //   .from(workflowUsageCurrentCycleTbl)
  //   .where(
  //     and(
  //       eq(workflowUsageCurrentCycleTbl.repositoryId, repositoryId),
  //       gte(
  //         workflowUsageCurrentCycleTbl.updatedAt,
  //         subDays(startOfTomorrow(), 60),
  //       ),
  //       gte(workflowUsageCurrentCycleTbl.dollar, 1),
  //     ),
  //   );

  return {
    entries,
    timeToMerge,
    timeToReview,
    timeToReviewed,
    dataChangeLeadTime: await dataLoaderChangeLeadTime({
      isDemo,
      db: wasmDb,
      repositoryId,
    }),
    dataRelease: await dataLoaderRelease({ isDemo, db: wasmDb, repositoryId }),
    dataChangeFailureRate,
    dataFailedDeploymentRecoveryTime,
    workflowUsageCurrentCycles: workflowUsageCurrentCyclesFiltered
      .filter(({ dollar }) => dollar > 0)
      .sort((a, b) => b.dollar - a.dollar),
    usageByWorkflowsDaily: repoWorkflows
      .map((repoWorkflow) => {
        const usages = [...Array(60).keys()].map((_, i) => {
          const currentDate = subDays(startOfToday(), i);

          const usage = workflowUsageCurrentCyclesDaily.find(
            (usage) =>
              usage.workflowId === repoWorkflow.id &&
              usage.day === currentDate.getDate() &&
              usage.month === currentDate.getMonth() + 1,
          );

          return {
            value: usage?.dollar || null,
            date: currentDate,
          };
        });

        return {
          usageByWorkflowName: repoWorkflow.name,
          data: usages.sort((a, b) => a.date.getTime() - b.date.getTime()),
        };
      })
      .filter((usage) =>
        usage.data.some((data) => data.value && data.value > 5),
      )
      .sort((a, b) =>
        a.usageByWorkflowName.localeCompare(b.usageByWorkflowName),
      ), // 5ドル未満のデータは除外
  };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const isDemo = params.workspaceId === "demo";
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const {
    entries,
    timeToMerge,
    timeToReview,
    timeToReviewed,
    dataChangeLeadTime,
    dataRelease,
    dataChangeFailureRate,
    dataFailedDeploymentRecoveryTime,
    workflowUsageCurrentCycles,
    usageByWorkflowsDaily,
  } = loadData;

  const { repositoryId } = useParams();

  const maxDate = endOfToday();
  const [selectedDates, setSelectedDates] = React.useState<
    DateRange | undefined
  >({
    from: subDays(maxDate, 30),
    to: maxDate,
  });

  const [chart, setChart] = useState<ReactNode | null>(null);
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        const TimeHeatMap = await import("react-time-heatmap");
        setChart(
          <TimeHeatMap.TimeHeatMap
            // TODO: windowサイズに合わせリサイズ
            // timeEntries={entries.slice(0, 24 * 30)}
            timeEntries={entries}
            numberOfGroups={10}
            flow
            showGroups={false}
          />,
        );
      }
    })();
  }, [entries]);

  return (
    <>
      <section aria-labelledby="repository-summary">
        <h1
          id="repository-summary"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50"
        >
          {repositoryId}
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          {(isDemo || Number.isInteger(timeToMerge?.averageIn30Days)) && (
            <CategoryBarCard
              title="Time to merge"
              change={
                isDemo
                  ? "+1.4%"
                  : timeToMerge?.improvePercentage &&
                    `${timeToMerge?.improvePercentage}%`
              }
              value={
                isDemo
                  ? "2.1 days"
                  : `${Math.round((Number(timeToMerge?.averageIn30Days) * 10) / (60 * 60 * 1000)) / 10} hours`
              }
              valueDescription="average release time"
              subtitle="last 30 days"
              ctaDescription="About four key:"
              ctaText="reference"
              ctaLink="#"
              data={isDemo ? data : timeToMerge?.bars || []}
            />
          )}

          {(isDemo || Number.isInteger(timeToReview?.averageIn30Days)) && (
            <CategoryBarCard
              title="Time until review"
              change={
                isDemo
                  ? "-1.2%"
                  : timeToReview?.improvePercentage &&
                    `${timeToReview?.improvePercentage}%`
              }
              value={
                isDemo
                  ? "4.6 hours"
                  : `${Math.round((Number(timeToReview?.averageIn30Days) * 10) / (60 * 60 * 1000)) / 10} hours`
              }
              valueDescription="average merge time"
              subtitle="last 30 days"
              ctaDescription="About this metrics:"
              ctaText="reference"
              ctaLink="#"
              data={isDemo ? data2 : timeToReview?.bars || []}
            />
          )}

          {(isDemo || Number.isInteger(timeToReviewed?.averageIn30Days)) && (
            <CategoryBarCard
              title="Time until being reviewed"
              change={
                isDemo
                  ? "+1.4%"
                  : timeToReviewed?.improvePercentage &&
                    `${timeToReviewed?.improvePercentage}%`
              }
              value={
                isDemo
                  ? "7.1 hours"
                  : `${Math.round((Number(timeToReviewed?.averageIn30Days) * 10) / (60 * 60 * 1000)) / 10} hours`
              }
              valueDescription="average review time"
              subtitle="last 30 days"
              ctaDescription="About this metrics:"
              ctaText="reference"
              ctaLink="#"
              data={
                isDemo
                  ? data3
                  : timeToReviewed?.bars.map((bar) => ({
                      title: bar.title,
                      percentage: bar.percentage,
                      value: `${bar.value} PRs`,
                      color: bar.color,
                    })) || []
              }
            />
          )}
        </div>
      </section>

      <section aria-labelledby="commits">
        <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          People Activity
        </h1>

        <p className="mt-1 text-gray-500">
          The heatmap shows the number of commits and reviews by hour of day.
        </p>

        <Card className="py-4 mt-4 sm:mt-4 lg:mt-6">
          <div className="w-full h-[380px] text-gray-500">{chart}</div>
          <div className="flex justify-between mt-6 text-sm font-medium text-gray-500">
            <span>{subDays(Date.now(), 60).toLocaleDateString()}</span>
            <span>{subDays(Date.now(), 30).toLocaleDateString()}</span>
            <span>{subDays(Date.now(), 0).toLocaleDateString()}</span>
          </div>
        </Card>
      </section>

      <section aria-labelledby="actions-usage">
        <h1
          id="actions-usage"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Four Keys
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
            title="Deployment Frequency"
            type="release"
            selectedPeriod="last-month"
            selectedDates={selectedDates}
            data={dataRelease.data}
            accumulation
          />

          <ChartCard
            title="Change Lead Time"
            type="hour"
            selectedPeriod="last-month"
            selectedDates={selectedDates}
            data={dataChangeLeadTime.data}
            accumulation
            showAverageWithAccumulatedValue
          />

          <ChartCard
            title="Change Failure Rate (Example)"
            type="percentage"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataChangeFailureRate.data}
            accumulation={false}
          />

          <ChartCard
            title="Failed Deployment Recovery Time (Example)"
            type="hour"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataFailedDeploymentRecoveryTime.data}
            accumulation={false}
          />
        </dl>
      </section>

      {/*<section aria-labelledby="vulnerabilities-graph">*/}
      {/*  <h1*/}
      {/*    id="vulnerabilities-graph"*/}
      {/*    className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"*/}
      {/*  >*/}
      {/*    Vulnerabilities Stats*/}
      {/*  </h1>*/}
      {/*  <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">*/}
      {/*    <Filterbar*/}
      {/*      maxDate={maxDate}*/}
      {/*      minDate={new Date(2024, 0, 1)}*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      onDatesChange={(dates) => setSelectedDates(dates)}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*  <dl*/}
      {/*    className={cx(*/}
      {/*      "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",*/}
      {/*    )}*/}
      {/*  >*/}
      {/*    <ChartCard*/}
      {/*      title="Critical Count"*/}
      {/*      type="vulnerabilities"*/}
      {/*      selectedPeriod="last-year"*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      accumulation={false}*/}
      {/*      data={dataVulnerabilityCritical.data}*/}
      {/*    />*/}
      {/*    <ChartCard*/}
      {/*      title="High Count"*/}
      {/*      type="vulnerabilities"*/}
      {/*      selectedPeriod="last-year"*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      accumulation={false}*/}
      {/*      data={dataVulnerabilityHigh.data}*/}
      {/*    />*/}
      {/*    <ChartCard*/}
      {/*      title="Low Count"*/}
      {/*      type="vulnerabilities"*/}
      {/*      selectedPeriod="last-year"*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      accumulation={false}*/}
      {/*      data={dataVulnerabilityLow.data}*/}
      {/*    />*/}
      {/*  </dl>*/}
      {/*</section>*/}

      <section aria-labelledby="actions-usage" className="mt-16">
        <h1
          id="actions usage history"
          className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Actions usage{" "}
          <span className="text-sm text-gray-500">
            (based on billing cycle)
          </span>
        </h1>
        <dl
          className={cx(
            "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
          )}
        >
          {usageByWorkflowsDaily.map((usageByWorkflow) => (
            <ChartCard
              key={usageByWorkflow?.usageByWorkflowName}
              title={usageByWorkflow?.usageByWorkflowName}
              type="currency"
              selectedPeriod="no-comparison"
              selectedDates={selectedDates}
              accumulation={false}
              data={usageByWorkflow.data}
            />
          ))}
        </dl>
      </section>

      <section aria-labelledby="actions-cost">
        <h1
          id="actions-cost"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Latest actions usage{" "}
          <span className="text-sm text-gray-500">(current billing cycle)</span>
        </h1>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Path</TableHeaderCell>
                <TableHeaderCell className="text-right">Costs</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflowUsageCurrentCycles.map((item) => (
                <TableRow key={item.workflowId}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    {item.workflowName}
                  </TableCell>
                  <TableCell>{item.workflowPath}</TableCell>
                  <TableCell className="text-right">${item.dollar}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>
    </>
  );
}
