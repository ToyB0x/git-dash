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
import { dataLoaderRelease } from "@/routes/(login)/$groupId/release/dataLoaders";
import { startOfToday, subDays } from "date-fns";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Link, redirect, useLoaderData } from "react-router";
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
    latestVersion: "v2.1.9",
    count: 124,
    lastRelease: "23/09/2023 13:00",
  },
  {
    repository: "org/frontend",
    latestVersion: "v1.1.2",
    count: 91,
    lastRelease: "22/09/2023 10:45",
  },
  {
    repository: "org/payment",
    latestVersion: "v3.3.1",
    count: 61,
    lastRelease: "22/09/2023 10:45",
  },
  {
    repository: "org/backend",
    latestVersion: "v0.0.9",
    count: 21,
    lastRelease: "21/09/2023 14:30",
  },
  {
    repository: "org/serviceX",
    latestVersion: "v11.2.4",
    instance: "Ubuntu 2-core",
    count: 6,
    lastRelease: "24/09/2023 09:15",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  const isDemo = params.groupId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }

  const dataRelease = await dataLoaderRelease(isDemo);

  return {
    dataRelease,
  };
}

// TODO: add PR page
export default function Page() {
  const { dataRelease } = useLoaderData<typeof clientLoader>();

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
            title="Release Count"
            type="release"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataRelease.data}
          />
        </dl>
      </section>

      <section aria-labelledby="high-cost-actions">
        <h1
          id="high-cost-actions"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Releases by repository
        </h1>
        <p className="mt-1 text-gray-500">
          full repository details are available on{" "}
          <Link to="../users" className="underline underline-offset-4">
            repositories menu
          </Link>
        </p>
        <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">
          <Filterbar
            maxDate={maxDate}
            minDate={new Date(2024, 0, 1)}
            selectedDates={selectedDates}
            onDatesChange={(dates) => setSelectedDates(dates)}
          />
        </div>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell>Latest version</TableHeaderCell>
                <TableHeaderCell>Count</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Last release
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataTable.map((item) => (
                <TableRow key={item.repository}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    {item.repository}
                  </TableCell>
                  <TableCell>{item.latestVersion}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell className="text-right">
                    {item.lastRelease}
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

// TODO: add vuln page
// - add vuln by severity graph
// - add most affected repositories ranking
// - add vuln detection rate
// - add vuln siverity rate