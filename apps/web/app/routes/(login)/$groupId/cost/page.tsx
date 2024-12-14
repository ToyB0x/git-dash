"use client";
import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { ProgressBarCard } from "@/components/ui/overview/DashboardProgressBarCard";
import { cx } from "@/lib/utils";
import { subDays, toDate } from "date-fns";
import React from "react";
import type { DateRange } from "react-day-picker";
import { overviews } from "./data/overview-data";
import type { OverviewData } from "./data/schema";

export type PeriodValue = "previous-period" | "last-year" | "no-comparison";

const categories: {
  title: keyof OverviewData;
  type: "currency" | "unit";
}[] = [
  {
    title: "Actions",
    type: "currency",
  },
  {
    title: "Seats",
    type: "currency",
  },
  {
    title: "Copilots",
    type: "currency",
  },
  // {
  //   title: "Rows read",
  //   type: "unit",
  // },
  // {
  //   title: "Queries",
  //   type: "unit",
  // },
  // {
  //   title: "Payments completed",
  //   type: "currency",
  // },
];

export type KpiEntry = {
  title: string;
  percentage: number;
  current: number;
  allowed: number;
  unit?: string;
};

const data: KpiEntry[] = [
  {
    title: "Seats",
    percentage: 98.1,
    current: 119,
    allowed: 121,
    unit: "seats",
  },
  {
    title: "Actions (included)",
    percentage: 100,
    current: 3000,
    allowed: 3000,
    unit: "min",
  },
  {
    title: "Storage",
    percentage: 26,
    current: 0.8,
    allowed: 2,
    unit: "GB",
  },
];

export type KpiEntryExtended = Omit<
  KpiEntry,
  "current" | "allowed" | "unit"
> & {
  value: string;
  color: string;
};

const data2: KpiEntryExtended[] = [
  {
    title: "Actions",
    percentage: 50.8,
    value: "$1961.1",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "Seats",
    percentage: 28.1,
    value: "$200",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "Copilot",
    percentage: 16.1,
    value: "$391.9",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "Others",
    percentage: 5,
    value: "$31.9",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const data3: KpiEntryExtended[] = [
  {
    title: "Ubuntu 16-core",
    percentage: 63.8,
    value: "$1221.1",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "Ubuntu 2-core",
    percentage: 18.1,
    value: "$202",
    color: "bg-purple-600 dark:bg-purple-500",
  },
  {
    title: "Ubuntu 4-core",
    percentage: 16.1,
    value: "$21.9",
    color: "bg-indigo-600 dark:bg-indigo-500",
  },
  {
    title: "Others",
    percentage: 5,
    value: "$3.9",
    color: "bg-gray-400 dark:bg-gray-600",
  },
];

const overviewsDates = overviews.map((item) => toDate(item.date).getTime());
const maxDate = toDate(Math.max(...overviewsDates));

export default function Overview() {
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
          Current billing cycle
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <ProgressBarCard
            title="Usage"
            change="+0.2%"
            value="96.1%"
            valueDescription="of reserved seats"
            ctaDescription="Monthly usage resets in 12 days."
            ctaText="Manage plan."
            ctaLink="#"
            data={data}
          />
          <CategoryBarCard
            title="Costs"
            change="-1.4%"
            value="$3293.5"
            valueDescription="current billing cycle"
            subtitle="Current costs"
            ctaDescription="Next payment due"
            ctaText="December 31, 2024"
            ctaLink="#"
            data={data2}
          />
          <CategoryBarCard
            title="Actions"
            change="+9.4%"
            value="$1889.5"
            valueDescription="current billing cycle"
            subtitle="Current costs"
            ctaDescription="Next payment due"
            ctaText="December 31, 2024"
            ctaLink="#"
            data={data3}
          />
        </div>
      </section>
      <section aria-labelledby="usage-overview">
        <h1
          id="usage-overview"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Overview
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
          {categories.map((category) => {
            return (
              <ChartCard
                key={category.title}
                title={category.title}
                type={category.type}
                selectedDates={selectedDates}
                selectedPeriod={"last-year"}
              />
            );
          })}
        </dl>
      </section>
    </>
  );
}