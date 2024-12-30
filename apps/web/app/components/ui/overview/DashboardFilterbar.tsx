import { DateRangePicker } from "@/components/DatePicker";
import type { PeriodValue } from "@/components/ui/overview/DashboardChartCard";
import { subMonths, subYears } from "date-fns";
import type { DateRange } from "react-day-picker";

export const getPeriod = (
  dateRange: DateRange | undefined,
  selectedPeriod: PeriodValue,
): DateRange | undefined => {
  if (!dateRange) return undefined;
  const from = dateRange.from;
  const to = dateRange.to;
  if (selectedPeriod === "last-year") {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let lastYearFrom;
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let lastYearTo;
    if (from) {
      lastYearFrom = subYears(from, 1);
    }
    if (to) {
      lastYearTo = subYears(to, 1);
    }
    return { from: lastYearFrom, to: lastYearTo };
  }

  if (selectedPeriod === "last-month") {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let lastMonthFrom;
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let lastMonthTo;
    if (from) {
      lastMonthFrom = subMonths(from, 1);
    }
    if (to) {
      lastMonthTo = subMonths(to, 1);
    }
    return { from: lastMonthFrom, to: lastMonthTo };
  }

  throw Error("Invalid period value");
};

type FilterbarProps = {
  maxDate?: Date;
  minDate?: Date;
  selectedDates: DateRange | undefined;
  onDatesChange: (dates: DateRange | undefined) => void;
};

export function Filterbar({
  maxDate,
  minDate,
  selectedDates,
  onDatesChange,
}: FilterbarProps) {
  return (
    <div className="w-full sm:flex sm:items-center sm:gap-2">
      <DateRangePicker
        value={selectedDates}
        onChange={onDatesChange}
        className="w-full sm:w-fit"
        toDate={maxDate}
        fromDate={minDate}
        align="start"
      />
    </div>
  );
}
