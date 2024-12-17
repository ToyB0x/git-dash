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
  dataLoaderPrMerge,
  dataLoaderPrOpen,
} from "@/routes/(login)/$groupId/pr/dataLoaders";
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
    user: "C0d3r",
    avatar: "https://i.pravatar.cc/300",
    created: 123,
    merged: 125,
    lastMerged: "23/09/2024 13:00",
  },
  {
    user: "QuickSilver91",
    avatar: "https://i.pravatar.cc/301",
    created: 96,
    merged: 93,
    lastMerged: "22/09/2024 10:45",
  },
  {
    user: "Rock3tMan",
    avatar: "https://i.pravatar.cc/302",
    created: 66,
    merged: 53,
    lastMerged: "22/09/2024 10:45",
  },
  {
    user: "BananaEat3r",
    avatar: "https://i.pravatar.cc/303",
    created: 46,
    merged: 33,
    lastMerged: "21/09/2024 14:30",
  },
  {
    user: "Xg3tt3r",
    avatar: "https://i.pravatar.cc/304",
    created: 26,
    merged: 23,
    lastMerged: "24/09/2024 09:15",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  const isDemo = params.groupId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }

  const dataPrOpen = await dataLoaderPrOpen(isDemo);
  const dataPrMerge = await dataLoaderPrMerge(isDemo);

  return {
    dataPrOpen,
    dataPrMerge,
  };
}

// TODO: add PR page
export default function Page() {
  const { dataPrOpen, dataPrMerge } = useLoaderData<typeof clientLoader>();

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
            title="Time to review"
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
          PR Stats
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
            title="PR Open"
            type="pr"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataPrOpen.data}
          />

          <ChartCard
            title="PR Merged"
            type="pr"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataPrMerge.data}
          />
        </dl>
      </section>

      <section aria-labelledby="high-cost-actions">
        <h1
          id="high-cost-actions"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          PRs by user
        </h1>
        <p className="mt-1 text-gray-500">
          full user details are available on{" "}
          <Link to="../users" className="underline underline-offset-4">
            users menu
          </Link>
        </p>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="w-1">User</TableHeaderCell>
                <TableHeaderCell />
                <TableHeaderCell>PR Created</TableHeaderCell>
                <TableHeaderCell>PR Merged</TableHeaderCell>
                <TableHeaderCell>Last Merged</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataTable.map((item) => (
                <TableRow key={item.user}>
                  <TableCell className="p-0">
                    <img
                      src={item.avatar}
                      alt="user"
                      className="w-8 h-8 rounded-full"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    <Link
                      to={`../users/${item.user}`}
                      className="underline underline-offset-4"
                    >
                      {item.user}
                    </Link>
                  </TableCell>
                  <TableCell>{item.created} / month</TableCell>
                  <TableCell>{item.merged} / month</TableCell>
                  <TableCell>{item.lastMerged}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>
    </>
  );
}
