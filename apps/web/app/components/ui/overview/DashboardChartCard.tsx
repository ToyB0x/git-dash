import { Badge } from "@/components/Badge";
import { LineChart } from "@/components/LineChart";
import { cx, formatters, percentageFormatter } from "@/lib/utils";
import {
  eachDayOfInterval,
  formatDate,
  interval,
  isWithinInterval,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { getPeriod } from "./DashboardFilterbar";

export type PeriodValue = "previous-period" | "last-year" | "no-comparison";

export type CardProps = {
  title: string;
  type:
    | "currency"
    | "unit"
    | "percentage"
    | "pr"
    | "review"
    | "release"
    | "vulnerabilities"
    | "hour";
  selectedDates: DateRange | undefined;
  selectedPeriod: PeriodValue;
  data: {
    date: Date;
    value: number;
  }[];
  isThumbnail?: boolean;
  accumulation?: boolean; // グラフの積み上げ表示
};

const formattingMap = {
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  currency: formatters["currency"],
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  unit: formatters["unit"],
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  percentage: formatters["percentage"],
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  release: formatters["release"],
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  pr: formatters["pr"],
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  review: formatters["review"],
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  vulnerabilities: formatters["vulnerabilities"],
  // biome-ignore lint/complexity/useLiteralKeys: <explanation>
  hour: formatters["hour"],
};

export const getBadgeType = (value: number) => {
  if (value > 0) {
    return "success";
  }
  if (value < 0) {
    if (value < -50) {
      return "warning";
    }
    return "error";
  }
  return "neutral";
};

export function ChartCard({
  title,
  type,
  data,
  selectedDates,
  selectedPeriod,
  isThumbnail,
  accumulation = true,
}: CardProps) {
  const formatter = formattingMap[type];
  const selectedDatesInterval =
    selectedDates?.from && selectedDates?.to
      ? interval(selectedDates.from, selectedDates.to)
      : null;
  const allDatesInInterval =
    selectedDates?.from && selectedDates?.to
      ? eachDayOfInterval(interval(selectedDates.from, selectedDates.to)).slice(
          0,
          -1,
        ) // データ収集中である本日を含めない
      : null;
  const prevDates = getPeriod(selectedDates);

  const prevDatesInterval =
    prevDates?.from && prevDates?.to
      ? interval(prevDates.from, prevDates.to)
      : null;

  const curData = data
    .filter((d) => {
      if (selectedDatesInterval) {
        return isWithinInterval(d.date, selectedDatesInterval);
      }
      return true;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const prevData = data
    .filter((d) => {
      if (prevDatesInterval) {
        return isWithinInterval(d.date, prevDatesInterval);
      }
      return false;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = allDatesInInterval
    ?.map((date, index) => {
      const currentData = curData[index];
      const previousData = prevData[index];

      return {
        title,
        date,
        formattedDate: formatDate(date, "dd/MM/yyyy"),
        value: currentData?.value,
        previousDate: previousData?.date,
        previousFormattedDate: previousData
          ? formatDate(previousData.date, "dd/MM/yyyy")
          : null,
        previousValue:
          selectedPeriod !== "no-comparison" ? previousData?.value : null,
        evolution:
          selectedPeriod !== "no-comparison" &&
          currentData?.value &&
          previousData?.value
            ? (currentData.value - previousData.value) / previousData.value
            : undefined,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const categories =
    selectedPeriod === "no-comparison" ? ["value"] : ["value", "previousValue"];
  const value =
    chartData?.reduce((acc, item) => acc + (item.value || 0), 0) || 0;
  const previousValue =
    chartData?.reduce((acc, item) => acc + (item.previousValue || 0), 0) || 0;
  const evolution =
    selectedPeriod !== "no-comparison"
      ? (value - previousValue) / previousValue
      : 0;

  return (
    <div className={cx("transition")}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </dt>
          {selectedPeriod !== "no-comparison" && accumulation && (
            <Badge variant={getBadgeType(evolution)}>
              {percentageFormatter(evolution)}
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <dd className="text-xl text-gray-900 dark:text-gray-50">
          {accumulation
            ? formatter(value)
            : formatter(chartData?.[chartData?.length - 1]?.value)}
        </dd>
        {selectedPeriod !== "no-comparison" && (
          <dd className="text-sm text-gray-500">
            from{" "}
            {accumulation
              ? formatter(previousValue)
              : formatter(chartData?.[chartData?.length - 1]?.previousValue)}
          </dd>
        )}
      </div>
      <LineChart
        className="mt-6 h-32"
        data={chartData || []}
        index="formattedDate"
        colors={["indigo", "gray"]}
        startEndOnly={true}
        valueFormatter={(value) => formatter(value as number)}
        showYAxis={false}
        showLegend={false}
        categories={categories}
        showTooltip={!isThumbnail}
        autoMinValue
      />
    </div>
  );
}
