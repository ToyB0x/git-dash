import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { cx } from "@/lib/utils";
import type { FC } from "react";
import type { DateRange } from "react-day-picker";
import type { loaderUsageByWorkflowsDaily } from "../loaders";

type Props = {
  selectedDates: DateRange | undefined;
  usageByWorkflowsDaily: Awaited<
    ReturnType<typeof loaderUsageByWorkflowsDaily>
  >;
};

export const ActionsUsageGraph: FC<Props> = ({
  selectedDates,
  usageByWorkflowsDaily,
}) => (
  <section aria-labelledby="actions-usage" className="mt-16">
    <h1
      id="actions usage history"
      className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      Actions usage{" "}
      <span className="text-sm text-gray-500">(based on billing cycle)</span>
    </h1>
    <dl
      className={cx(
        "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {usageByWorkflowsDaily.map((usageByWorkflow) => (
        <ChartCard
          key={usageByWorkflow?.usageByWorkflowName}
          title={usageByWorkflow?.usageByWorkflowName}
          type="currency"
          selectedPeriod="no-comparison"
          selectedDates={selectedDates}
          accumulation={false}
          data={usageByWorkflow.data}
        />
      ))}
    </dl>
  </section>
);
