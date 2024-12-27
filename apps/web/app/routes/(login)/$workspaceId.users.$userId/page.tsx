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
import { cx } from "@/lib/utils";
import type { Route } from "@@/(login)/$workspaceId.users.$userId/+types/page";
import { prTbl, repositoryTbl, reviewTbl, userTbl } from "@repo/db-shared";
import { startOfToday, subDays } from "date-fns";
import { desc, eq } from "drizzle-orm";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Link, redirect, useParams } from "react-router";
import {
  dataLoaderPrMerge,
  dataLoaderPrOpen,
  dataLoaderReviews,
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
    title: "~1 hour",
    percentage: 11.2,
    value: "43 PRs",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "2~4 hours",
    percentage: 21.2,
    value: "93 PRs",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "5~24 hours",
    percentage: 41.2,
    value: "121 PRs",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "25~ hours",
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
    title: "~1 hour",
    percentage: 17.4,
    value: "35 PRs",
    color: "bg-green-600 dark:bg-green-500",
  },
  {
    title: "1~4 hours",
    percentage: 61.2,
    value: "83 PRs",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "5~24 hours",
    percentage: 4.2,
    value: "8 PRs",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "25~ hours",
    percentage: 3.1,
    value: "3 PRs",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const dataTable = [
  {
    repository: "org/api",
    prs: 124,
    reviews: 21,
    lastActivity: "23/09/2023 13:00",
  },
  {
    repository: "org/frontend",
    prs: 91,
    reviews: 12,
    lastActivity: "22/09/2023 10:45",
  },
  {
    repository: "org/payment",
    prs: 61,
    reviews: 9,
    lastActivity: "22/09/2023 10:45",
  },
  {
    repository: "org/backend",
    prs: 21,
    reviews: 3,
    lastActivity: "21/09/2023 14:30",
  },
  {
    repository: "org/serviceX",
    prs: 6,
    reviews: 1,
    lastActivity: "24/09/2023 09:15",
  },
  {
    repository: "org/serviceY",
    prs: 2,
    reviews: 1,
    lastActivity: "23/09/2024 21:42",
  },
  {
    repository: "org/serviceZ",
    prs: 1,
    reviews: 1,
    lastActivity: "21/09/2024 11:32",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const isDemo = params.workspaceId === "demo";

  const dataPrOpen = await dataLoaderPrOpen(isDemo);
  const dataPrMerge = await dataLoaderPrMerge(isDemo);
  const dataReviews = await dataLoaderReviews(isDemo);

  if (isDemo) {
    return {
      user: {
        avatarUrl: "https://i.pravatar.cc/300",
      },
      dataPrOpen,
      dataPrMerge,
      dataReviews,
      reviews: [],
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

  const users = await wasmDb
    .select()
    .from(userTbl)
    .where(eq(userTbl.login, params.userId));
  const user = users[0];
  if (!user) throw Error("User not found");

  const reviews = await wasmDb
    .select({
      id: reviewTbl.id,
      prId: reviewTbl.prId,
      prNumber: prTbl.number,
      repoName: repositoryTbl.name,
      repoOwner: repositoryTbl.owner,
    })
    .from(reviewTbl)
    .innerJoin(userTbl, eq(userTbl.id, reviewTbl.reviewerId))
    .innerJoin(prTbl, eq(prTbl.id, reviewTbl.prId))
    .innerJoin(repositoryTbl, eq(repositoryTbl.id, prTbl.repositoryId))
    .where(eq(userTbl.login, params.userId))
    .orderBy(desc(reviewTbl.createdAt));

  return {
    user,
    dataPrOpen,
    dataPrMerge,
    dataReviews,
    reviews,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { user, dataPrOpen, dataPrMerge, dataReviews, reviews } = loadData;

  const { userId } = useParams();

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
          id="user"
          className="flex items-center text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          <img
            src={user.avatarUrl}
            alt="user"
            className="w-12 h-12 rounded-full mr-3"
          />
          {userId}
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
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
            value="4.6 hours"
            valueDescription="average review time"
            subtitle="last 30 days"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            data={data3}
          />

          <CategoryBarCard
            title="Time until being reviewed"
            change="+1.4"
            value="7.1 hours"
            valueDescription="average reviewed time"
            subtitle="last 30 days"
            ctaDescription="About four key:"
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
          Stats
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

          <ChartCard
            title="Reviews"
            type="review"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            data={dataReviews.data}
          />
        </dl>
      </section>

      <section aria-labelledby="high-cost-actions">
        <h1
          id="high-cost-actions"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Activity by repository
        </h1>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell className="text-right">PRs</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Reviews
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Last Activity
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataTable.map((item) => (
                <TableRow key={item.repository}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    <Link
                      to={`${item.repository}`}
                      className="underline underline-offset-4"
                    >
                      {item.repository}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{item.prs}</TableCell>
                  <TableCell className="text-right">{item.reviews}</TableCell>
                  <TableCell className="text-right">
                    {item.lastActivity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>

      <section aria-labelledby="review">
        <h1 className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          Recent Reviews ({reviews.length} reviews in this month)
        </h1>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Review ID
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.slice(0, 10).map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    <a
                      href={`https://github.com/${review.repoOwner}/${review.repoName}/pull/${review.prNumber}`}
                      className="underline underline-offset-4"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {`${review.repoName}/${review.prNumber}`}
                    </a>
                  </TableCell>
                  <TableCell className="text-right">{review.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>
    </>
  );
}
