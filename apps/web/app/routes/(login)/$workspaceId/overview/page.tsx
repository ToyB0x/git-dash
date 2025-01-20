import { auth, getWasmDb } from "@/clients";
import { BarChart } from "@/components/BarChart";
import { Card } from "@/components/Card";
import { DonutChart } from "@/components/DonutChart";
import { NoDataMessage } from "@/components/ui/no-data";
import { cx } from "@/lib/utils";
import { Stats } from "@/routes/(login)/$workspaceId/overview/components/stats";
import type { Route } from "@@/(login)/$workspaceId/overview/+types/page";
import { subDays } from "date-fns";
import { type ReactNode, useEffect, useState } from "react";
import { Link, redirect } from "react-router";
import { Releases } from "./components";
import {
  type StatCardData,
  loaderCosts,
  loaderDaysInCurrentCycle,
  loaderHeatMaps,
  loaderReleases,
  loaderStatPr,
  loaderStatRelease,
  loaderStatVuln,
  loaderWorkflowUsageCurrentCycleOrg,
  sampleCosts,
  sampleHeatMaps,
  sampleStats,
  sampleWorkflowUsageOrg,
} from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      dataStats: sampleStats,
      heatMaps: sampleHeatMaps,
      costs: sampleCosts,
      releases: [],
      workflowUsageCurrentCycleOrg: sampleWorkflowUsageOrg,
      daysInCurrentCycle: 21,
    };
  }

  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const token = await auth.currentUser.getIdToken();
  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: token,
  });
  if (!wasmDb) return null;

  return {
    heatMaps: await loaderHeatMaps(wasmDb),
    releases: await loaderReleases(wasmDb),
    costs: await loaderCosts(wasmDb),
    daysInCurrentCycle: loaderDaysInCurrentCycle(wasmDb),
    workflowUsageCurrentCycleOrg:
      await loaderWorkflowUsageCurrentCycleOrg(wasmDb),
    dataStats: [
      await loaderStatPr(wasmDb),
      await loaderStatRelease(wasmDb),
      await loaderStatVuln(wasmDb),
      {
        name: "Change Failure Rate",
        stat: "-",
      },
    ] satisfies StatCardData[],
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

const currencyFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const isDemo = params.workspaceId === "demo";

  const {
    heatMaps,
    costs,
    releases,
    workflowUsageCurrentCycleOrg,
    dataStats,
    daysInCurrentCycle,
  } = loadData;

  // ref: https://zenn.dev/harukii/articles/a8b0b085b63244
  const [chart, setChart] = useState<ReactNode | null>(null);
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        const TimeHeatMap = await import("react-time-heatmap");
        setChart(
          <TimeHeatMap.TimeHeatMap
            // TODO: windowサイズに合わせリサイズ
            // timeEntries={heatMaps.slice(0, 24 * 30)}
            timeEntries={heatMaps}
            numberOfGroups={10}
            flow
            showGroups={false}
          />,
        );
      }
    })();
  }, [heatMaps]);

  return (
    <>
      <Stats dataStats={dataStats} />

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
              {/* データ収集中です。正確なコストの計算には最初は2〜3日かかりますという案内とともに、ひとまずWorkflowsRunBillingのデータ収集を3日だけ行いグラフ表示する？ */}
              <h3 className="flex justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  This billing cycle's
                </div>

                {costs.filter((item) => item.value !== null).length < 4 && (
                  <div className="text-sm text-red-300">
                    It takes about 3 days to collect the initial data. Please
                    wait a few days.
                  </div>
                )}
              </h3>
              <div className="flex justify-between items-baseline">
                <p className="font-semibold text-3xl text-gray-900 dark:text-gray-50">
                  ${" "}
                  {(
                    Math.round(
                      workflowUsageCurrentCycleOrg.reduce(
                        (acc, item) => acc + (item.dollar || 0),
                        0,
                      ) * 100,
                    ) / 100
                  ).toLocaleString()}
                  {/*${" "}*/}
                  {/*{Math.round(*/}
                  {/*    (costs.reduce((acc, item) => acc + (item.value || 0), 0) /*/}
                  {/*        costs.length) **/}
                  {/*    10,*/}
                  {/*) / 10}{" "}*/}
                  {/*/ day*/}
                </p>
                <span className="text-sm text-gray-500">
                  {daysInCurrentCycle &&
                    `${daysInCurrentCycle} days left in this cycle`}
                </span>
              </div>
              <BarChart
                data={costs}
                index="date" // specify object field
                categories={["value"]}
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
              Current billing cycle expenses
            </h3>
            <DonutChart
              className="mx-auto mt-6"
              data={workflowUsageCurrentCycleOrg}
              category="runnerType"
              value="dollar"
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
              {workflowUsageCurrentCycleOrg
                .sort((a, b) => b.dollar - a.dollar)
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

                    const totalUsage = workflowUsageCurrentCycleOrg.reduce(
                      (acc, item) => acc + item.dollar,
                      0,
                    );

                    if (i < 3) {
                      const share =
                        Math.round((item.dollar / totalUsage) * 100 * 10) / 10;
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
                      dollar:
                        // biome-ignore lint/style/noNonNullAssertion: <explanation>
                        i === 3 ? item.dollar : item.dollar + acc[3]?.dollar!,
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
                    dollar: number;
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
                        {currencyFormatter(item.dollar)}
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

      <section aria-labelledby="commits">
        <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          People Activity
        </h1>

        <p className="mt-1 text-gray-500">
          for more details, check on the{" "}
          <Link to="../users" className="underline underline-offset-4">
            users page
          </Link>
          .
        </p>

        <Card className="py-4 mt-4 sm:mt-4 lg:mt-6">
          <div className="w-full h-[380px] text-gray-500">{chart}</div>
          <div className="flex justify-between mt-6 text-sm font-medium text-gray-500">
            <span>{subDays(Date.now(), 60).toLocaleDateString()}</span>
            <span>{subDays(Date.now(), 30).toLocaleDateString()}</span>
            <span>{subDays(Date.now(), 0).toLocaleDateString()}</span>
          </div>
        </Card>
      </section>

      {isDemo ? <Releases isDemo /> : <Releases releases={releases} />}
    </>
  );
}
