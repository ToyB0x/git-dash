import { auth, fetchReport } from "@/clients";
import { BarChart } from "@/components/BarChart";
import { Card } from "@/components/Card";
import { DonutChart } from "@/components/DonutChart";
import { cx } from "@/lib/utils";
import {
  type Schema as StatActionUsageCurrentCycle,
  stat as statActionUsageCurrentCycle,
} from "@repo/schema/statActionUsageCurrentCycle";
import {
  type Schema as StatCostSchema,
  stat as statCost,
} from "@repo/schema/statCost";
import { Link, redirect } from "react-router";
import type { Route } from "../../../../../.react-router/types/app/routes/(login)/$workspaceId/overview/+types/page";

const dataStats = [
  {
    name: "Pull requests / month",
    stat: "128",
    change: "+1.8%",
    changeType: "positive",
  },
  {
    name: "Releases / month",
    stat: "42",
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
    name: "Vulnerabilities (critical)",
    stat: "29",
    change: "+19.7%",
    changeType: "negative",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      costs: dataChart,
      actionsUsageCurrentCycle: dataDonut,
    };
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const token = await auth.currentUser.getIdToken();
  const fetchCostResult = await fetchReport<StatCostSchema>(
    token,
    statCost.type,
    params.workspaceId,
    statCost.schema,
  );

  const daysInThisMonth = (): number => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  };

  const thisMonthDates = [...Array(daysInThisMonth()).keys()].map((index) => {
    return index + 1;
  });

  const data = thisMonthDates.map((day) => {
    if (!fetchCostResult.success) {
      return {
        date: `${day}`,
        cost: null,
      };
    }

    return {
      date: `${day}`,
      cost:
        new Date(fetchCostResult.data.stats.date).getDate() === day
          ? fetchCostResult.data.stats.cost
          : null,
    };
  });

  const fetchActionUsageCurrentCycleResult =
    await fetchReport<StatActionUsageCurrentCycle>(
      token,
      statActionUsageCurrentCycle.type,
      params.workspaceId,
      statActionUsageCurrentCycle.schema,
    );

  return {
    costs: fetchCostResult.success
      ? // ? [fetchCostResult.data.stats, { date: "Jan 23", cost: null }]
        data
      : [],
    actionsUsageCurrentCycle: fetchActionUsageCurrentCycleResult.success
      ? fetchActionUsageCurrentCycleResult.data.stats
      : [],
  };
}

function valueFormatter(number: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: "USD",
  });

  return formatter.format(number);
}

const dataChart = [
  { date: "Jan 23", cost: 68 },
  { date: "Feb 23", cost: 70 },
  { date: "Mar 23", cost: 80 },
  { date: "Apr 23", cost: 55 },
  { date: "May 23", cost: 56 },
  { date: "Jun 23", cost: 81 },
  { date: "Jul 23", cost: 85 },
  { date: "Aug 23", cost: 80 },
  { date: "Sep 23", cost: 75 },
  { date: "Oct 23", cost: 71 },
  { date: "Nov 23", cost: 61 },
  { date: "Dec 23", cost: 60 },
  { date: "Jan 23", cost: 68 },
  { date: "Feb 23", cost: 70 },
  { date: "Mar 23", cost: 80 },
  { date: "Apr 23", cost: 55 },
  { date: "May 23", cost: 56 },
  { date: "Jun 23", cost: 92 },
  { date: "Jul 23", cost: 85 },
  { date: "Aug 23", cost: 80 },
  { date: "Sep 23", cost: 75 },
  { date: "Oct 23", cost: 71 },
  { date: "Nov 23", cost: 61 },
  { date: "Dec 23", cost: 60 },
  { date: "Mar 23", cost: 80 },
  { date: "Apr 23", cost: 55 },
  { date: "May 23", cost: 56 },
  { date: "Jun 23", cost: 98 },
  { date: "Jul 23", cost: 85 },
  { date: "Aug 23", cost: 80.2 },
];

const currencyFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

const dataDonut = [
  {
    runnerType: "Ubuntu 16 core",
    cost: 6730,
  },
  {
    runnerType: "Ubuntu 2 core",
    cost: 4120,
  },
  {
    runnerType: "Windows 8 core",
    cost: 3920,
  },
  {
    runnerType: "Windows 32 core",
    cost: 2120,
  },
];

export default function Page({ loaderData }: Route.ComponentProps) {
  const { costs, actionsUsageCurrentCycle } = loaderData;

  return (
    <>
      <section aria-labelledby="stat-cards">
        <h1
          id="vulnerabilities-table"
          className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Summary
        </h1>

        <p className="mt-1 text-gray-500">
          for more details, click on the{" "}
          <Link to="../fourkeys" className="underline underline-offset-4">
            four keys page
          </Link>{" "}
          /{" "}
          <Link to="../vulns" className="underline underline-offset-4">
            vulns page
          </Link>
          .
        </p>

        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <h1
          id="vulnerabilities-table"
          className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Costs
        </h1>

        <p className="mt-1 text-gray-500">
          for more details, check on the{" "}
          <Link to="../cost" className="underline underline-offset-4">
            cost page
          </Link>
          .
        </p>

        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-4 sm:grid-cols-2 lg:mt-6 xl:grid-cols-3">
          <div className="col-span-2">
            <Card>
              <h3 className="text-sm text-gray-500 dark:text-gray-500">
                This month's cost
              </h3>
              <p className="font-semibold text-3xl text-gray-900 dark:text-gray-50">
                $ {costs.reduce((acc, item) => acc + (item.cost || 0), 0)}
              </p>
              <BarChart
                data={costs}
                index="date"
                categories={["cost"]}
                showLegend={false}
                colors={["blue"]}
                valueFormatter={valueFormatter}
                yAxisWidth={50}
                className="mt-6 hidden h-80 sm:block"
              />
            </Card>
          </div>

          <Card className="sm:mx-auto sm:max-w-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Total expenses by instance
              <br />
              <span className="text-xs text-gray-500">
                (current billing cycle)
              </span>
            </h3>
            <DonutChart
              className="mx-auto mt-6"
              data={actionsUsageCurrentCycle}
              category="runnerType"
              value="cost"
              showLabel={true}
              valueFormatter={currencyFormatter}
              showTooltip={false}
              colors={["blue", "indigo", "violet", "gray"]}
            />
            <p className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <span>Category</span>
              <span>Amount / Share</span>
            </p>
            <ul className="mt-2 divide-y divide-gray-200 text-sm text-gray-500 dark:divide-gray-800 dark:text-gray-500">
              {actionsUsageCurrentCycle
                .sort((a, b) => b.cost - a.cost)
                .reduce(
                  (acc, item, i) => {
                    let color = "";

                    switch (i) {
                      case 0:
                        color = "bg-blue-500 dark:bg-blue-500";
                        break;
                      case 1:
                        color = "bg-indigo-500 dark:bg-indigo-500";
                        break;
                      case 2:
                        color = "bg-violet-500 dark:bg-violet-500";
                        break;
                      default:
                        color = "bg-gray-500";
                    }

                    const totalUsage = actionsUsageCurrentCycle.reduce(
                      (acc, item) => acc + item.cost,
                      0,
                    );

                    if (i < 3) {
                      const share =
                        Math.round((item.cost / totalUsage) * 100 * 10) / 10;
                      return [
                        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
                        ...acc,
                        {
                          ...item,
                          share,
                          color,
                        },
                      ];
                    }

                    const others = {
                      // biome-ignore lint/style/noNonNullAssertion: <explanation>
                      cost: i === 3 ? item.cost : item.cost + acc[3]?.cost!,
                      share: Math.round(
                        100 -
                          acc
                            .slice(0, 3)
                            .reduce((acc, item) => acc + item.share, 0),
                      ),
                      color,
                      runnerType: "Others",
                    };
                    acc[3] = others;
                    return acc;
                  },
                  [] as {
                    runnerType: string;
                    cost: number;
                    share: number;
                    color: string;
                  }[],
                )
                .map((item) => (
                  <li
                    key={item.runnerType}
                    className="relative flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span
                        className={cx(
                          item.color,
                          "size-2.5 shrink-0 rounded-sm",
                        )}
                        aria-hidden={true}
                      />
                      <span className="truncate dark:text-gray-300">
                        {item.runnerType.toUpperCase().replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="flex items-center space-x-2">
                      <span className="font-medium tabular-nums text-gray-900 dark:text-gray-50">
                        {currencyFormatter(item.cost)}
                      </span>
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium tabular-nums text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {item.share}%
                      </span>
                    </p>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </section>

      <section aria-labelledby="vulnerabilities-table">
        <h1
          id="vulnerabilities-table"
          className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Recent Activity
        </h1>

        <p className="mt-1 text-gray-500">
          for more details, click on the repository links.
        </p>

        <Card className="mt-6">
          <h3 className="flex font-semibold text-gray-900 dark:text-gray-50">
            <img
              src="https://i.pravatar.cc/300"
              alt="repository"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex justify-center flex-col pl-4">
              <p>Release v2.1.3 🎉</p>
              <Link
                to="../repositories/org/frontend"
                className="underline underline-offset-4 text-sm"
              >
                org/frontend
              </Link>
            </div>
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-900 dark:text-gray-50">
            What's Changed
          </p>
          <ul className="hidden text-sm leading-6 text-gray-900 sm:block dark:text-gray-50 list-disc pl-6">
            <li>chore(deps): upgrade remix to v2 by @user in #1212</li>
            <li>fix(ui): fix minor UI bug in the app by @user in #1211</li>
            <li>feat(ui): add new UI component to the app by @user in #1210</li>
          </ul>
        </Card>

        <Card className="mt-6">
          <h3 className="flex font-semibold text-gray-900 dark:text-gray-50">
            <img
              src="https://i.pravatar.cc/301"
              alt="repository"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex justify-center flex-col pl-4">
              <p>Release v9.5.4 🎉</p>
              <Link
                to="../repositories/org/api"
                className="underline underline-offset-4 text-sm"
              >
                org/api
              </Link>
            </div>
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-900 dark:text-gray-50">
            What's Changed
          </p>
          <ul className="hidden text-sm leading-6 text-gray-900 sm:block dark:text-gray-50 list-disc pl-6">
            <li>feat(app): add new feature to the app by @user in #941</li>
            <li>fix(app): fix minor bug in the app by @user in #940</li>
            <li>fix(deps): fix broken dependency by @renovate in #939</li>
          </ul>
        </Card>
      </section>
    </>
  );
}
