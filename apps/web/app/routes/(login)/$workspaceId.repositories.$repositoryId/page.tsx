import { auth } from "@/clients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { cx } from "@/lib/utils";
import {
  dataLoaderVulnerabilityCritical,
  dataLoaderVulnerabilityHigh,
  dataLoaderVulnerabilityLow,
} from "@/routes/(login)/$workspaceId/vuln/dataLoaders";
import { startOfToday, subDays } from "date-fns";
import React from "react";
import type { DateRange } from "react-day-picker";
import { redirect, useLoaderData, useParams } from "react-router";
import type { Route } from "../../../../.react-router/types/app/routes/(login)/$workspaceId.users.$userId/+types/page";
import {
  dataLoaderChangeFailureRate,
  dataLoaderChangeLeadTime,
  dataLoaderFailedDeploymentRecoveryTime,
  dataLoaderRelease,
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

const dataTable = [
  {
    action: "unit test",
    costs: "$3,509.00",
    instance: "Ubuntu 16-core",
    time: 1024,
    lastRun: "23/09/2023 13:00",
  },
  {
    action: "visual regression test",
    costs: "$5,720.00",
    instance: "Ubuntu 16-core",
    time: 894,
    lastRun: "22/09/2023 10:45",
  },
  {
    action: "build",
    costs: "$5,720.00",
    instance: "Ubuntu 4-core",
    time: 781,
    lastRun: "22/09/2023 10:45",
  },
  {
    action: "unit test",
    costs: "$4,200.00",
    instance: "Ubuntu 4-core",
    time: 651,
    lastRun: "21/09/2023 14:30",
  },
  {
    action: "E2E test",
    costs: "$2,100.00",
    instance: "Ubuntu 2-core",
    time: 424,
    lastRun: "24/09/2023 09:15",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  const isDemo = params.workspaceId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }

  const dataChangeLeadTime = await dataLoaderChangeLeadTime(isDemo);
  const dataRelease = await dataLoaderRelease(isDemo);
  const dataChangeFailureRate = await dataLoaderChangeFailureRate(isDemo);
  const dataFailedDeploymentRecoveryTime =
    await dataLoaderFailedDeploymentRecoveryTime(isDemo);

  const dataVulnerabilityCritical =
    await dataLoaderVulnerabilityCritical(isDemo);
  const dataVulnerabilityHigh = await dataLoaderVulnerabilityHigh(isDemo);
  const dataVulnerabilityLow = await dataLoaderVulnerabilityLow(isDemo);

  return {
    dataChangeLeadTime,
    dataRelease,
    dataChangeFailureRate,
    dataFailedDeploymentRecoveryTime,
    dataVulnerabilityCritical,
    dataVulnerabilityHigh,
    dataVulnerabilityLow,
  };
}

export default function Page() {
  const {
    dataChangeLeadTime,
    dataRelease,
    dataChangeFailureRate,
    dataFailedDeploymentRecoveryTime,
    dataVulnerabilityCritical,
    dataVulnerabilityHigh,
    dataVulnerabilityLow,
  } = useLoaderData<typeof clientLoader>();
  const { repositoryId } = useParams();

  const maxDate = startOfToday();
  const [selectedDates, setSelectedDates] = React.useState<
    DateRange | undefined
  >({
    from: subDays(maxDate, 30),
    to: maxDate,
  });

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
          <CategoryBarCard
            title="Time to release (four key)"
            change="+1.4"
            value="9.1 days"
            valueDescription="average release time"
            subtitle="last 30 days"
            ctaDescription="About four key:"
            ctaText="reference"
            ctaLink="#"
            data={data}
          />

          <CategoryBarCard
            title="Time to merge"
            change="-0.6%"
            value="2.1 days"
            valueDescription="average merge time"
            subtitle="last 30 days"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            data={data2}
          />

          <CategoryBarCard
            title="Time until review"
            change="-1.2%"
            value="1.3 days"
            valueDescription="average review time"
            subtitle="last 30 days"
            ctaDescription="About this metrics:"
            ctaText="reference"
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
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataRelease.data}
          />

          <ChartCard
            title="Change Lead Time"
            type="hour"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataChangeLeadTime.data}
            accumulation={false}
          />

          <ChartCard
            title="Change Failure Rate"
            type="percentage"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataChangeFailureRate.data}
            accumulation={false}
          />

          <ChartCard
            title="Failed Deployment Recovery Time"
            type="hour"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataFailedDeploymentRecoveryTime.data}
            accumulation={false}
          />
        </dl>
      </section>

      <section aria-labelledby="vulnerabilities-graph">
        <h1
          id="vulnerabilities-graph"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Vulnerabilities Stats
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
            title="Critical Count"
            type="vulnerabilities"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            accumulation={false}
            data={dataVulnerabilityCritical.data}
          />
          <ChartCard
            title="High Count"
            type="vulnerabilities"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            accumulation={false}
            data={dataVulnerabilityHigh.data}
          />
          <ChartCard
            title="Low Count"
            type="vulnerabilities"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            accumulation={false}
            data={dataVulnerabilityLow.data}
          />
        </dl>
      </section>

      <section aria-labelledby="actions-cost">
        <h1
          id="actions-cost"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Actions cost
        </h1>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Instance</TableHeaderCell>
                <TableHeaderCell>Time(min)</TableHeaderCell>
                <TableHeaderCell className="text-right">Costs</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Last run
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataTable.map((item) => (
                <TableRow key={item.action}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    {item.action}
                  </TableCell>
                  <TableCell>{item.instance}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell className="text-right">{item.costs}</TableCell>
                  <TableCell className="text-right">{item.lastRun}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>
    </>
  );
}
