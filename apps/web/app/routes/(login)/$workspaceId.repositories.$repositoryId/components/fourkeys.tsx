import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { cx } from "@/lib/utils";
import type { FC } from "react";
import type { DateRange } from "react-day-picker";
import type {
  loaderChangeFailureRate,
  loaderChangeLeadTime,
  loaderFailedDeploymentRecoveryTime,
  loaderReleases,
} from "../loaders";

type Props = {
  maxDate: Date;
  selectedDates: DateRange | undefined;
  setSelectedDates: (dates: DateRange | undefined) => void;
  dataRelease: Awaited<ReturnType<typeof loaderReleases>>;
  dataChangeLeadTime: Awaited<ReturnType<typeof loaderChangeLeadTime>>;
  dataChangeFailureRate: Awaited<ReturnType<typeof loaderChangeFailureRate>>;
  dataFailedDeploymentRecoveryTime: Awaited<
    ReturnType<typeof loaderFailedDeploymentRecoveryTime>
  >;
};

export const Fourkeys: FC<Props> = ({
  maxDate,
  selectedDates,
  setSelectedDates,
  dataRelease,
  dataChangeLeadTime,
  dataChangeFailureRate,
  dataFailedDeploymentRecoveryTime,
}) => (
  <section aria-labelledby="actions-usage">
    <h1
      id="actions-usage"
      className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      Four Keys
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
        title="Deployment Frequency"
        type="release"
        selectedPeriod="last-month"
        selectedDates={selectedDates}
        data={dataRelease.data}
        accumulation
      />

      <ChartCard
        title="Change Lead Time"
        type="hour"
        selectedPeriod="last-month"
        selectedDates={selectedDates}
        data={dataChangeLeadTime.data}
        accumulation
        showAverageWithAccumulatedValue
      />

      <ChartCard
        title="Change Failure Rate (Example)"
        type="percentage"
        selectedPeriod="last-year"
        selectedDates={selectedDates}
        data={dataChangeFailureRate.data}
        accumulation={false}
      />

      <ChartCard
        title="Failed Deployment Recovery Time (Example)"
        type="hour"
        selectedPeriod="last-year"
        selectedDates={selectedDates}
        data={dataFailedDeploymentRecoveryTime.data}
        accumulation={false}
      />
    </dl>
  </section>
);
