import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { cx } from "@/lib/utils";
import { startOfTomorrow, subDays } from "date-fns";
import type { FC } from "react";

type Props = {
  usageByRunnerTypes: {
    runnerType: string;
    data: {
      date: Date;
      value: number | null;
    }[];
  }[];
};

export const Actions: FC<Props> = ({ usageByRunnerTypes }) => {
  const endDate = startOfTomorrow();
  const span = {
    from: subDays(endDate, 30),
    to: endDate,
  };

  return (
    <section aria-labelledby="actions-usage" className="mt-16">
      <h1
        id="actions-usage"
        className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
      >
        Actions usage{" "}
        <span className="text-gray-500 text-sm">Based on billing cycle</span>
      </h1>
      <dl
        className={cx(
          "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {usageByRunnerTypes.map((usageByRunnerType) => (
          <ChartCard
            key={usageByRunnerType.runnerType}
            title={usageByRunnerType.runnerType
              .toUpperCase()
              .replaceAll("_", " ")}
            type="currency"
            selectedPeriod="no-comparison"
            selectedDates={span}
            accumulation
            data={usageByRunnerType.data}
          />
        ))}
      </dl>
    </section>
  );
};
