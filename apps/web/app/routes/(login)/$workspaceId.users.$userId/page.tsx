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
import type { Route } from "@@/(login)/$workspaceId.users.$userId/+types/page";
import {
  prCommitTbl,
  prTbl,
  repositoryTbl,
  reviewTbl,
  userTbl,
} from "@repo/db-shared";
import { endOfToday, startOfToday, subDays, subHours } from "date-fns";
import { and, asc, count, desc, eq, gte, lt } from "drizzle-orm";
import React, { type ReactNode, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Link, redirect, useParams } from "react-router";
import type { ITimeEntry } from "react-time-heatmap";
import {
  dataLoaderPrMerge,
  dataLoaderPrOpen,
  dataLoaderReviews,
  dataLoaderTimeToMerge,
  dataLoaderTimeToReview,
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

type Activity = {
  repository: string;
  prs: number;
  reviews: number;
  lastActivity: Date | string | undefined;
};

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
] satisfies Activity[];

const demoEntries: ITimeEntry[] = [...Array(24 * 60).keys()].map((hour) => ({
  time: subHours(endOfToday(), hour),
  count:
    subHours(endOfToday(), hour).getDay() <= 1
      ? Math.floor(Math.random() * 1.1) // 週末は低頻度にする
      : // 早朝深夜は低頻度にする
        subHours(endOfToday(), hour).getHours() < 8 ||
          subHours(endOfToday(), hour).getHours() > 20
        ? Math.floor(Math.random() * 1.1)
        : // 平日の昼間は高頻度にする
          Math.floor(Math.random() * 10),
}));

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
      dataPrOpen: dataPrOpen.data,
      dataPrMerge: dataPrMerge.data,
      dataReviews: dataReviews.data,
      activity: dataTable,
      entries: demoEntries,
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

  const prs = await wasmDb
    .select()
    .from(prTbl)
    .where(eq(prTbl.authorId, user.id))
    .orderBy(desc(prTbl.createdAt));

  const reviews = await wasmDb
    .select({
      id: reviewTbl.id,
      prId: reviewTbl.prId,
      prNumber: prTbl.number,
      createdAt: reviewTbl.createdAt,
      repoName: repositoryTbl.name,
      repoOwner: repositoryTbl.owner,
    })
    .from(reviewTbl)
    .innerJoin(userTbl, eq(userTbl.id, reviewTbl.reviewerId))
    .innerJoin(prTbl, eq(prTbl.id, reviewTbl.prId))
    .innerJoin(repositoryTbl, eq(repositoryTbl.id, prTbl.repositoryId))
    .where(eq(userTbl.login, params.userId))
    .orderBy(desc(reviewTbl.createdAt));

  const hasPrRepository = await wasmDb
    .selectDistinct({
      repositoryId: prTbl.repositoryId,
    })
    .from(prTbl)
    .where(eq(prTbl.authorId, user.id))
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id));

  const hasReviewRepository = await wasmDb
    .selectDistinct({
      repositoryId: prTbl.repositoryId,
    })
    .from(reviewTbl)
    .innerJoin(prTbl, eq(prTbl.id, reviewTbl.prId))
    .innerJoin(repositoryTbl, eq(prTbl.repositoryId, repositoryTbl.id))
    .where(eq(reviewTbl.reviewerId, user.id));

  const relatedRepositoryIds = [
    ...new Set([
      ...hasPrRepository.map((pr) => pr.repositoryId),
      ...hasReviewRepository.map((review) => review.repositoryId),
    ]),
  ];

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
                eq(prCommitTbl.authorId, user.id),
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
                eq(reviewTbl.reviewerId, user.id),
                gte(reviewTbl.createdAt, subHours(endOfToday(), hour)),
                lt(reviewTbl.createdAt, subHours(endOfToday(), hour - 1)),
              ),
            )
        )[0]?.count || 0),
    })),
  );

  const timeToMerge = await dataLoaderTimeToMerge(wasmDb, user.id);
  const timeToReview = await dataLoaderTimeToReview(wasmDb, user.id);
  const timeToReviewed = await dataLoaderTimeToReviewed(wasmDb, user.id);

  const oldPrs = await wasmDb
    .select()
    .from(prTbl)
    .orderBy(asc(prTbl.createdAt))
    .limit(1);
  const oldReviews = await wasmDb
    .select()
    .from(reviewTbl)
    .orderBy(asc(reviewTbl.createdAt))
    .limit(1);

  const maxOldPr = oldPrs[0];
  const maxOldReview = oldReviews[0];

  return {
    user,
    entries,
    timeToMerge,
    timeToReview,
    timeToReviewed,
    maxOldPr,
    maxOldReview,
    dataPrOpen: [...Array(300).keys()].map((_, i) => {
      return {
        date: subDays(startOfToday(), i),
        value: prs.filter(
          (pr) =>
            pr.createdAt >= subDays(startOfToday(), i) &&
            pr.createdAt < subDays(startOfToday(), i - 1),
        ).length,
      };
    }),
    dataPrMerge: [...Array(300).keys()].map((_, i) => {
      return {
        date: subDays(startOfToday(), i),
        value: prs.filter(
          (pr) =>
            pr.mergedAt &&
            pr.mergedAt >= subDays(startOfToday(), i) &&
            pr.mergedAt < subDays(startOfToday(), i - 1),
        ).length,
      };
    }),
    dataReviews: [...Array(300).keys()].map((_, i) => {
      return {
        date: subDays(startOfToday(), i),
        value: reviews.filter(
          (reviews) =>
            reviews.createdAt >= subDays(startOfToday(), i) &&
            reviews.createdAt < subDays(startOfToday(), i - 1),
        ).length,
      };
    }),
    activity: (await Promise.all(
      relatedRepositoryIds.map(async (repositoryId) => {
        const prs = await wasmDb
          .select()
          .from(prTbl)
          .where(
            and(
              eq(prTbl.authorId, user.id),
              eq(prTbl.repositoryId, repositoryId),
              gte(prTbl.createdAt, subDays(startOfToday(), 180)),
            ),
          )
          .orderBy(desc(prTbl.createdAt));

        const reviews = await wasmDb
          .select({ createdAt: reviewTbl.createdAt })
          .from(reviewTbl)
          .leftJoin(prTbl, eq(prTbl.id, reviewTbl.prId))
          .where(
            and(
              eq(reviewTbl.reviewerId, user.id),
              eq(prTbl.repositoryId, repositoryId),
              gte(reviewTbl.createdAt, subDays(startOfToday(), 180)),
            ),
          )
          .orderBy(desc(reviewTbl.createdAt));

        const repositoryNames = await wasmDb
          .select()
          .from(repositoryTbl)
          .where(eq(repositoryTbl.id, repositoryId));

        const repositoryName = repositoryNames[0]?.name;

        return {
          repository: repositoryName || "Unknown",
          prs: prs.length,
          reviews: reviews.length,
          lastActivity:
            prs[0]?.createdAt && reviews[0]?.createdAt
              ? prs[0]?.createdAt > reviews[0]?.createdAt
                ? prs[0]?.createdAt
                : reviews[0]?.createdAt
              : prs[0]?.createdAt || reviews[0]?.createdAt,
        };
      }),
    )) satisfies Activity[],
  };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const isDemo = params.workspaceId === "demo";
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const {
    user,
    dataPrOpen,
    dataPrMerge,
    dataReviews,
    activity,
    entries,
    timeToMerge,
    timeToReview,
    timeToReviewed,
    maxOldPr,
    maxOldReview,
  } = loadData;

  const { userId } = useParams();

  const maxDate = startOfToday();
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
          {(isDemo || Number.isInteger(timeToMerge?.averageIn30Days)) && (
            <CategoryBarCard
              title="Time to merge"
              change={
                isDemo
                  ? "-0.6%"
                  : timeToMerge?.improvePercentage &&
                    `${timeToMerge?.improvePercentage}%`
              }
              value={
                isDemo
                  ? "2.1 days"
                  : `${Math.round((Number(timeToMerge?.averageIn30Days) * 10) / (60 * 60 * 1000)) / 10} hours`
              }
              valueDescription="average merge time"
              subtitle="last 30 days"
              ctaDescription="About this metrics:"
              ctaText="reference"
              ctaLink="#"
              data={isDemo ? data2 : timeToMerge?.bars || []}
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
              valueDescription="average review time"
              subtitle="last 30 days"
              ctaDescription="About this metrics:"
              ctaText="reference"
              ctaLink="#"
              data={isDemo ? data3 : timeToReview?.bars || []}
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
              // value="7.1 hours"
              value={
                isDemo
                  ? "7.1 hours"
                  : `${Math.round((Number(timeToReviewed?.averageIn30Days) * 10) / (60 * 60 * 1000)) / 10} hours`
              }
              valueDescription="average reviewed time"
              subtitle="last 30 days"
              ctaDescription="About four key:"
              ctaText="reference"
              ctaLink="#"
              data={
                isDemo
                  ? data
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
            selectedPeriod="last-month"
            selectedDates={selectedDates}
            data={dataPrOpen}
          />

          <ChartCard
            title="PR Merged"
            type="pr"
            selectedPeriod="last-month"
            selectedDates={selectedDates}
            data={dataPrMerge}
          />

          <ChartCard
            title="Reviews"
            type="review"
            selectedPeriod="last-month"
            selectedDates={selectedDates}
            data={dataReviews}
          />
        </dl>
      </section>

      <section aria-labelledby="commits">
        <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          User Activity
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

      <section aria-labelledby="high-cost-actions">
        <h1
          id="high-cost-actions"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Activity by repository{" "}
          <span className="text-sm text-gray-500">(recent 6 months)</span>
        </h1>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell className="text-center">
                  Pull Requests
                  <br /> (
                  {maxOldPr
                    ? `${maxOldPr.createdAt.toLocaleDateString()}~`
                    : `${subDays(new Date(), 180).toLocaleDateString()}~`}
                  )
                </TableHeaderCell>
                <TableHeaderCell className="text-center">
                  Reviews
                  <br /> (
                  {maxOldReview
                    ? `${maxOldReview.createdAt.toLocaleDateString()}~`
                    : `${subDays(new Date(), 180).toLocaleDateString()}~`}
                  )
                </TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Last Activity
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activity.map((item) => (
                <TableRow key={item.repository}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    <Link
                      to={`../repositories/${item.repository}`}
                      className="underline underline-offset-4"
                    >
                      {item.repository}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">{item.prs}</TableCell>
                  <TableCell className="text-center">{item.reviews}</TableCell>
                  <TableCell className="text-right">
                    {item.lastActivity?.toLocaleString() || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>

      {/*<section aria-labelledby="review">*/}
      {/*  <h1 className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">*/}
      {/*    Recent Reviews ({reviews.length} reviews in this month)*/}
      {/*  </h1>*/}

      {/*  <TableRoot className="mt-8">*/}
      {/*    <Table>*/}
      {/*      <TableHead>*/}
      {/*        <TableRow>*/}
      {/*          <TableHeaderCell>Repository</TableHeaderCell>*/}
      {/*          <TableHeaderCell className="text-right">*/}
      {/*            Review ID*/}
      {/*          </TableHeaderCell>*/}
      {/*        </TableRow>*/}
      {/*      </TableHead>*/}
      {/*      <TableBody>*/}
      {/*        {reviews.slice(0, 10).map((review) => (*/}
      {/*          <TableRow key={review.id}>*/}
      {/*            <TableCell className="font-medium text-gray-900 dark:text-gray-50">*/}
      {/*              <a*/}
      {/*                href={`https://github.com/${review.repoOwner}/${review.repoName}/pull/${review.prNumber}`}*/}
      {/*                className="underline underline-offset-4"*/}
      {/*                target="_blank"*/}
      {/*                rel="noreferrer"*/}
      {/*              >*/}
      {/*                {`${review.repoName}/${review.prNumber}`}*/}
      {/*              </a>*/}
      {/*            </TableCell>*/}
      {/*            <TableCell className="text-right">{review.id}</TableCell>*/}
      {/*          </TableRow>*/}
      {/*        ))}*/}
      {/*      </TableBody>*/}
      {/*    </Table>*/}
      {/*  </TableRoot>*/}
      {/*</section>*/}
    </>
  );
}
