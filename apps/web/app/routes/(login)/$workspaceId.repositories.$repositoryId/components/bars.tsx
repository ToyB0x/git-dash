import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import type { FC } from "react";
import type {
  loaderTimeToMerge,
  loaderTimeToReview,
  loaderTimeToReviewed,
} from "../loaders";

type Props = {
  isDemo: boolean;
  repositoryName: string;
  timeToMerge: Awaited<ReturnType<typeof loaderTimeToMerge>> | undefined;
  timeToReview: Awaited<ReturnType<typeof loaderTimeToReview>> | undefined;
  timeToReviewed: Awaited<ReturnType<typeof loaderTimeToReviewed>> | undefined;
};

export const Bars: FC<Props> = ({
  isDemo,
  repositoryName,
  timeToMerge,
  timeToReview,
  timeToReviewed,
}) => (
  <section aria-labelledby="repository-summary">
    <h1
      id="repository-summary"
      className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50"
    >
      {repositoryName}
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
