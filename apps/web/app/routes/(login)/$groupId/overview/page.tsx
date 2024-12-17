import { auth } from "@/clients";
import { BarChart } from "@/components/BarChart";
import { Card } from "@/components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import { ChartCard } from "@/components/ui/overview/DashboardChartCard";
import { Filterbar } from "@/components/ui/overview/DashboardFilterbar";
import { cx } from "@/lib/utils";
import {
  dataLoaderVulnerabilityCritical,
  dataLoaderVulnerabilityHigh,
  dataLoaderVulnerabilityLow,
} from "@/routes/(login)/$groupId/vuln/dataLoaders";
import { startOfToday, subDays } from "date-fns";
import React from "react";
import type { DateRange } from "react-day-picker";
import { Link, redirect, useLoaderData } from "react-router";
import type { Route } from "../../../../../.react-router/types/app/routes/(login)/$groupId/+types/layout";

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

const dataTable = [
  {
    repository: "org/api",
    countCritical: 124,
    countHigh: 21,
    countLow: 16,
    lastDetected: "23/09/2023 13:00",
    enabledAnalysis: true,
  },
  {
    repository: "org/frontend",
    countCritical: 91,
    countHigh: 12,
    countLow: 9,
    lastDetected: "22/09/2023 10:45",
    enabledAnalysis: true,
  },
  {
    repository: "org/payment",
    countCritical: 61,
    countHigh: 9,
    countLow: 6,
    lastDetected: "22/09/2023 10:45",
    enabledAnalysis: true,
  },
  {
    repository: "org/backend",
    countCritical: 21,
    countHigh: 3,
    countLow: 2,
    lastDetected: "21/09/2023 14:30",
    enabledAnalysis: true,
  },
  {
    repository: "org/serviceX",
    countCritical: 6,
    countHigh: 1,
    countLow: 0,
    lastDetected: "24/09/2023 09:15",
    enabledAnalysis: true,
  },
  {
    repository: "org/serviceY",
    countCritical: "-",
    countHigh: "-",
    countLow: "-",
    lastDetected: "-",
    enabledAnalysis: false,
  },
  {
    repository: "org/serviceZ",
    countCritical: "-",
    countHigh: "-",
    countLow: "-",
    lastDetected: "-",
    enabledAnalysis: false,
  },
];

const dataStats = [
  {
    name: "Pull requests",
    stat: "128/month",
    change: "+1.8%",
    changeType: "positive",
  },
  {
    name: "Releases",
    stat: "42/month",
    change: "-12.5%",
    changeType: "negative",
  },
  {
    name: "Change Failure Rate",
    stat: "1.9%",
    change: "+0.4%",
    changeType: "positive",
  },
  {
    name: "Vulnerabilities",
    stat: "29 critical",
    change: "+19.7%",
    changeType: "negative",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  const isDemo = params.groupId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }

  const dataVulnerabilityCritical =
    await dataLoaderVulnerabilityCritical(isDemo);
  const dataVulnerabilityHigh = await dataLoaderVulnerabilityHigh(isDemo);
  const dataVulnerabilityLow = await dataLoaderVulnerabilityLow(isDemo);

  return {
    dataVulnerabilityCritical,
    dataVulnerabilityHigh,
    dataVulnerabilityLow,
  };
}

function valueFormatter(number: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
  });

  return formatter.format(number);
}

const dataChart = [
  { date: "Jan 23", "This Year": 68560, "Last Year": 28560 },
  { date: "Feb 23", "This Year": 70320, "Last Year": 30320 },
  { date: "Mar 23", "This Year": 80233, "Last Year": 70233 },
  { date: "Apr 23", "This Year": 55123, "Last Year": 45123 },
  { date: "May 23", "This Year": 56000, "Last Year": 80600 },
  { date: "Jun 23", "This Year": 81000, "Last Year": 85390 },
  { date: "Jul 23", "This Year": 85390, "Last Year": 45340 },
  { date: "Aug 23", "This Year": 80100, "Last Year": 70120 },
  { date: "Sep 23", "This Year": 75090, "Last Year": 69450 },
  { date: "Oct 23", "This Year": 71080, "Last Year": 63345 },
  { date: "Nov 23", "This Year": 61210, "Last Year": 100330 },
  { date: "Dec 23", "This Year": 60143, "Last Year": 45321 },
  { date: "Jan 23", "This Year": 68560, "Last Year": 28560 },
  { date: "Feb 23", "This Year": 70320, "Last Year": 30320 },
  { date: "Mar 23", "This Year": 80233, "Last Year": 70233 },
  { date: "Apr 23", "This Year": 55123, "Last Year": 45123 },
  { date: "May 23", "This Year": 56000, "Last Year": 80600 },
  { date: "Jun 23", "This Year": 92000, "Last Year": 85390 },
  { date: "Jul 23", "This Year": 85390, "Last Year": 45340 },
  { date: "Aug 23", "This Year": 80100, "Last Year": 70120 },
  { date: "Sep 23", "This Year": 75090, "Last Year": 69450 },
  { date: "Oct 23", "This Year": 71080, "Last Year": 63345 },
  { date: "Nov 23", "This Year": 61210, "Last Year": 100330 },
  { date: "Dec 23", "This Year": 60143, "Last Year": 45321 },
  { date: "Mar 23", "This Year": 80233, "Last Year": 70233 },
  { date: "Apr 23", "This Year": 55123, "Last Year": 45123 },
  { date: "May 23", "This Year": 56000, "Last Year": 80600 },
  { date: "Jun 23", "This Year": 98000, "Last Year": 85390 },
  { date: "Jul 23", "This Year": 85390, "Last Year": 45340 },
  { date: "Aug 23", "This Year": 80100, "Last Year": 70120 },
];

export default function Page() {
  const {
    dataVulnerabilityCritical,
    dataVulnerabilityHigh,
    dataVulnerabilityLow,
  } = useLoaderData<typeof clientLoader>();

  const maxDate = startOfToday();
  const [selectedDates, setSelectedDates] = React.useState<
    DateRange | undefined
  >({
    from: subDays(maxDate, 30),
    to: maxDate,
  });

  return (
    <>
      <section aria-labelledby="stat-cards">
        <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {dataStats.map((item) => (
            <Card key={item.name} className="py-4">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-500">
                {item.name}
              </dt>
              <dd className="mt-2 flex items-baseline space-x-2.5">
                <span className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                  {item.stat}
                </span>
                <span
                  className={cx(
                    item.changeType === "positive"
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500",
                    "text-sm font-medium",
                  )}
                >
                  {item.change}
                </span>
              </dd>
            </Card>
          ))}
        </dl>
      </section>

      <section aria-labelledby="current-billing-cycle">
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <div className="col-span-2">
            <Card>
              <h3 className="text-sm text-gray-500 dark:text-gray-500">
                This month's cost
              </h3>
              <p className="font-semibold text-3xl text-gray-900 dark:text-gray-50">
                $2,604.00
              </p>
              <BarChart
                data={dataChart}
                index="date"
                categories={["This Year"]}
                showLegend={false}
                colors={["blue"]}
                valueFormatter={valueFormatter}
                yAxisWidth={50}
                className="mt-6 hidden h-64 sm:block"
              />
            </Card>
          </div>

          <CategoryBarCard
            title="Found Vulnerabilities"
            change="+1.4"
            value="141 "
            valueDescription="total vulnerabilities"
            subtitle="current result"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            data={data}
          />
        </div>
      </section>
      <section aria-labelledby="vulnerabilities-graph">
        <h1
          id="vulnerabilities-graph"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Vulnerabilities Stats
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
            title="Critical Count"
            type="vulnerabilities"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            accumulation={false}
            data={dataVulnerabilityCritical.data}
          />
          <ChartCard
            title="High Count"
            type="vulnerabilities"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            accumulation={false}
            data={dataVulnerabilityHigh.data}
          />
          <ChartCard
            title="Low Count"
            type="vulnerabilities"
            selectedPeriod="last-year"
            selectedDates={selectedDates}
            accumulation={false}
            data={dataVulnerabilityLow.data}
          />
        </dl>
      </section>

      <section aria-labelledby="vulnerabilities-table">
        <h1
          id="vulnerabilities-table"
          className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Vulnerabilities by repository
        </h1>

        <p className="mt-1 text-gray-500">
          for more details, click on the repository links.
        </p>

        <TableRoot className="mt-8">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell>Analysis enabled</TableHeaderCell>
                <TableHeaderCell>Critical</TableHeaderCell>
                <TableHeaderCell>High</TableHeaderCell>
                <TableHeaderCell>Low</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Last detected
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataTable.map((item) => (
                <TableRow key={item.repository}>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                    <Link
                      to={`../repositories/${item.repository}`}
                      className="underline underline-offset-4"
                    >
                      {item.repository}
                    </Link>{" "}
                  </TableCell>
                  <TableCell>{String(item.enabledAnalysis)}</TableCell>
                  <TableCell>{item.countCritical}</TableCell>
                  <TableCell>{item.countHigh}</TableCell>
                  <TableCell>{item.countLow}</TableCell>
                  <TableCell className="text-right">
                    {item.lastDetected}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>
    </>
  );
}
