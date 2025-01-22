import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { cx } from "@/lib/utils";
import type { FC } from "react";
import type { DateRange } from "react-day-picker";
import type { loaderPrMerge, loaderPrOpen, loaderReviews } from "../loaders";

type Props = {
  maxDate: Date;
  selectedDates: DateRange | undefined;
  setSelectedDates: (dates: DateRange | undefined) => void;
  dataPrOpen: Awaited<ReturnType<typeof loaderPrOpen>>;
  dataPrMerge: Awaited<ReturnType<typeof loaderPrMerge>>;
  dataReviews: Awaited<ReturnType<typeof loaderReviews>>;
};

export const Stats: FC<Props> = ({
  maxDate,
  selectedDates,
  setSelectedDates,
  dataPrOpen,
  dataPrMerge,
  dataReviews,
}) => (
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
);
