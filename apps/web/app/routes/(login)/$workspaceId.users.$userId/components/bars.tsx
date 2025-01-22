import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import type { FC } from "react";
import type {
  loaderTimeToMerge,
  loaderTimeToReview,
  loaderTimeToReviewed,
} from "../loaders";

type Props = {
  isDemo: boolean;
  userName: string;
  avatarUrl: string;
  timeToMerge: Awaited<ReturnType<typeof loaderTimeToMerge>> | undefined;
  timeToReview: Awaited<ReturnType<typeof loaderTimeToReview>> | undefined;
  timeToReviewed: Awaited<ReturnType<typeof loaderTimeToReviewed>> | undefined;
};

export const Bars: FC<Props> = ({
  isDemo,
  userName,
  avatarUrl,
  timeToMerge,
  timeToReview,
  timeToReviewed,
}) => (
  <section aria-labelledby="stats">
    <h1
      id="user"
      className="flex items-center text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      <img src={avatarUrl} alt="user" className="w-12 h-12 rounded-full mr-3" />
      {userName}
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
);

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
