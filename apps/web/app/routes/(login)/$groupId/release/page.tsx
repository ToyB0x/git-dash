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
    title: "1 release",
    percentage: 15.4,
    value: "3 Repository",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "2~5 release",
    percentage: 25.4,
    value: "3 Repository",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "6~10 release",
    percentage: 39.4,
    value: "6 Repository",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "11~ release",
    percentage: 41.1,
    value: "6 Repository",
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
            title="Releases by repository"
            change="-0.6%"
            value="3.2 releases"
            valueDescription="average release count"
            subtitle="last 30 days"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            data={data2}
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
          <Link to="../repositories" className="underline underline-offset-4">
            repositories menu
          </Link>
        </p>

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
                  <TableCell>{item.count} / month</TableCell>
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
