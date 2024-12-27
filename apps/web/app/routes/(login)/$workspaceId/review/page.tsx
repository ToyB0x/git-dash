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
import type { Route } from "@@/(login)/$workspaceId/review/+types/page";
import { startOfToday, subDays } from "date-fns";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Link, redirect, useLoaderData } from "react-router";
import { dataLoaderReviewCount, dataLoaderReviewTime } from "./dataLoaders";

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
    percentage: 5.2,
    value: "12 PRs",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "2~7 days",
    percentage: 51.2,
    value: "53 PRs",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "8~14 days",
    percentage: 31.2,
    value: "41 PRs",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "15~ days",
    percentage: 10.1,
    value: "21 PRs",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const data2: KpiEntryExtended[] = [
  {
    title: "0~3",
    percentage: 17.4,
    value: "35 PRs",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "4~10",
    percentage: 61.2,
    value: "83 PRs",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "11~20",
    percentage: 4.2,
    value: "8 PRs",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "21~",
    percentage: 3.1,
    value: "3 PRs",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const dataTable = [
  {
    user: "C0d3r",
    avatar: "https://i.pravatar.cc/300",
    count: 123,
    average: 1.6,
    lastMerged: "23/09/2024 13:00",
  },
  {
    user: "QuickSilver91",
    avatar: "https://i.pravatar.cc/301",
    count: 96,
    average: 2.1,
    lastMerged: "22/09/2024 10:45",
  },
  {
    user: "Rock3tMan",
    avatar: "https://i.pravatar.cc/302",
    count: 66,
    average: 3.3,
    lastMerged: "22/09/2024 10:45",
  },
  {
    user: "BananaEat3r",
    avatar: "https://i.pravatar.cc/303",
    count: 46,
    average: 4.5,
    lastMerged: "21/09/2024 14:30",
  },
  {
    user: "Xg3tt3r",
    avatar: "https://i.pravatar.cc/304",
    count: 26,
    average: 6.7,
    lastMerged: "24/09/2024 09:15",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  const isDemo = params.workspaceId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }

  const dataReviews = await dataLoaderReviewCount(isDemo);
  const dataReviewTime = await dataLoaderReviewTime(isDemo);

  return {
    dataReviews,
    dataReviewTime,
  };
}

export default function Page() {
  const { dataReviews, dataReviewTime } = useLoaderData<typeof clientLoader>();

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
            title="Time to first review"
            change="+1.4"
            value="3.1 hours"
            valueDescription="average review time"
            subtitle="last 30 days"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            data={data}
          />

          <CategoryBarCard
            title="Count by PR"
            change="-1.2%"
            value="4.3 reviews"
            valueDescription="average reviews count for each PR"
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
          Review Stats
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
            title="Reviews"
            type="review"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataReviews.data}
          />

          <ChartCard
            title="Review Waiting Time"
            type="hour"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataReviewTime.data}
          />
        </dl>
      </section>

      <section aria-labelledby="high-cost-actions">
        <h1
          id="high-cost-actions"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Reviews by user
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
                <TableHeaderCell>Reviews</TableHeaderCell>
                <TableHeaderCell>First Review Average (hour)</TableHeaderCell>
                <TableHeaderCell>Last Reviewed</TableHeaderCell>
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
                  <TableCell>{item.count} / month</TableCell>
                  <TableCell>{item.average}</TableCell>
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
