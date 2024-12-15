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
import { CircleProgressCard } from "@/components/ui/overview/DashboardCicleProgressCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { cx } from "@/lib/utils";
import {
  dataLoaderVulnerabilityCritical,
  dataLoaderVulnerabilityHigh,
  dataLoaderVulnerabilityLow,
} from "@/routes/(login)/$groupId/vuln/dataLoaders";
import { startOfToday, subDays } from "date-fns";
import React from "react";
import type { DateRange } from "react-day-picker";
import { redirect, useLoaderData } from "react-router";
import type { Route } from "../../../../../.react-router/types/app/routes/(login)/$groupId/+types/layout";

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
    title: "Critical",
    percentage: 11.2,
    value: "12 packages",
    color: "bg-red-600 dark:bg-red-500",
  },
  {
    title: "High",
    percentage: 31.2,
    value: "21 packages",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "Low",
    percentage: 21.2,
    value: "16 packages",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "Moderate",
    percentage: 41.2,
    value: "42 packages",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const dataTable = [
  {
    repository: "org/api",
    countCritical: 124,
    countHigh: 21,
    countLow: 16,
    lastDetected: "23/09/2023 13:00",
  },
  {
    repository: "org/frontend",
    countCritical: 91,
    countHigh: 12,
    countLow: 9,
    lastDetected: "22/09/2023 10:45",
  },
  {
    repository: "org/payment",
    countCritical: 61,
    countHigh: 9,
    countLow: 6,
    lastDetected: "22/09/2023 10:45",
  },
  {
    repository: "org/backend",
    countCritical: 21,
    countHigh: 3,
    countLow: 2,
    lastDetected: "21/09/2023 14:30",
  },
  {
    repository: "org/serviceX",
    countCritical: 6,
    countHigh: 1,
    countLow: 0,
    lastDetected: "24/09/2023 09:15",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  const isDemo = params.groupId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }

  const dataVulnerabilityCritical =
    await dataLoaderVulnerabilityCritical(isDemo);
  const dataVulnerabilityHigh = await dataLoaderVulnerabilityHigh(isDemo);
  const dataVulnerabilityLow = await dataLoaderVulnerabilityLow(isDemo);

  return {
    dataVulnerabilityCritical,
    dataVulnerabilityHigh,
    dataVulnerabilityLow,
  };
}

// TODO: add PR page
export default function Page() {
  const {
    dataVulnerabilityCritical,
    dataVulnerabilityHigh,
    dataVulnerabilityLow,
  } = useLoaderData<typeof clientLoader>();

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
          Current cycle
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <CircleProgressCard
            title="Analysis enabled Repositories"
            change="+2"
            value="71 repositoriess"
            valueDescription="enabled"
            subtitle="GitHub Advisory Database Enabled"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            child={71}
            parent={92}
          />

          <CategoryBarCard
            title="Found Vulnerabilities"
            change="+1.4"
            value="141 "
            valueDescription="total vulnerabilities"
            subtitle="current result"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            data={data}
          />
        </div>
      </section>
      <section aria-labelledby="actions-usage">
        <h1
          id="actions-usage"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Release Stats
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

      <section aria-labelledby="high-cost-actions">
        <h1
          id="high-cost-actions"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Vulnerabilities by repository
        </h1>
        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell>Critical</TableHeaderCell>
                <TableHeaderCell>High</TableHeaderCell>
                <TableHeaderCell>Low</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Last detected
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataTable.map((item) => (
                <TableRow key={item.repository}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    {item.repository}
                  </TableCell>
                  <TableCell>{item.countCritical}</TableCell>
                  <TableCell>{item.countHigh}</TableCell>
                  <TableCell>{item.countLow}</TableCell>
                  <TableCell className="text-right">
                    {item.lastDetected}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>
    </>
  );
}
