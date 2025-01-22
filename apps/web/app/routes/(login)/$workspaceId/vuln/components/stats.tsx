import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import { CircleProgressCard } from "@/components/ui/overview/DashboardCicleProgressCard";
import type { FC } from "react";
import type { loaderRepositories } from "../loaders";
import type { AlertData } from "../loaders";

type Props = {
  isDemo: boolean;
  alerts: AlertData[];
  repositories?: Awaited<ReturnType<typeof loaderRepositories>>;
};

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

const sampleData: KpiEntryExtended[] = [
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

export const AlertStats: FC<Props> = ({ isDemo, alerts, repositories }) => (
  <section aria-labelledby="current-billing-cycle">
    <h1
      id="current-billing-cycle"
      className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      Current cycle
    </h1>
    <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
      <CategoryBarCard
        title="Found Vulnerabilities"
        // value="141"
        value={
          isDemo
            ? "141"
            : alerts.reduce(
                (acc, repo) =>
                  acc +
                  repo.countCritical +
                  repo.countHigh +
                  repo.countMedium +
                  repo.countLow,
                0,
              )
        }
        valueDescription="total vulnerabilities"
        subtitle="current result"
        ctaDescription="About this metrics:"
        ctaText="reference"
        ctaLink="#"
        data={
          isDemo
            ? sampleData
            : [
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
                  title: "Medium",
                  percentage: 21.2,
                  value: "16 packages",
                  color: "bg-indigo-600 dark:bg-indigo-500",
                },
                {
                  title: "Low",
                  percentage: 41.2,
                  value: "42 packages",
                  color: "bg-gray-400 dark:bg-gray-600",
                },
              ].map((item, i) => ({
                ...item,
                value: `${alerts.reduce(
                  (acc, repo) =>
                    acc +
                    (i === 0
                      ? repo.countCritical
                      : i === 1
                        ? repo.countHigh
                        : i === 2
                          ? repo.countMedium
                          : repo.countLow),
                  0,
                )} packages`,
                percentage:
                  (Math.round(
                    (alerts.reduce(
                      (acc, repo) =>
                        acc +
                        (i === 0
                          ? repo.countCritical
                          : i === 1
                            ? repo.countHigh
                            : i === 2
                              ? repo.countMedium
                              : repo.countLow),
                      0,
                    ) /
                      alerts.reduce(
                        (acc, repo) =>
                          acc +
                          repo.countCritical +
                          repo.countHigh +
                          repo.countMedium +
                          repo.countLow,
                        0,
                      )) *
                      1000,
                  ) *
                    100) /
                  1000,
              }))
        }
      />

      <CircleProgressCard
        title="Analysis enabled Repositories"
        value={
          isDemo
            ? "71 repositoriess"
            : `${repositories?.filter((r) => r.enabledAlert).length} repositories`
        }
        valueDescription="enabled"
        subtitle="GitHub Advisory Database Enabled"
        ctaDescription="About this metrics:"
        ctaText="reference"
        ctaLink="#"
        child={
          isDemo
            ? 71
            : Number(repositories?.filter((r) => r.enabledAlert).length)
        }
        parent={isDemo ? 92 : Number(repositories?.length)}
      />
    </div>
  </section>
);
