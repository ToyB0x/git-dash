import { auth, getWasmDb } from "@/clients";
import { BarChart } from "@/components/BarChart";
import { Card } from "@/components/Card";
import { DonutChart } from "@/components/DonutChart";
import { Tooltip } from "@/components/Tooltip";
import { NoDataMessage } from "@/components/ui/no-data";
import { renovateBotId } from "@/constants";
import { cx } from "@/lib/utils";
import type { Route } from "@@/(login)/$workspaceId/overview/+types/page";
import {
  billingCycleTbl,
  prCommitTbl,
  prTbl,
  releaseTbl,
  repositoryTbl,
  userTbl,
  workflowUsageCurrentCycleOrgTbl,
} from "@git-dash/db";
import { RiQuestionLine } from "@remixicon/react";
import { endOfToday, subDays, subHours } from "date-fns";
import { and, asc, count, desc, eq, gte, lt, not } from "drizzle-orm";
import { type ReactNode, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Link, redirect } from "react-router";
import type { ITimeEntry } from "react-time-heatmap";
import {
  type StatCardData,
  loaderStatPr,
  loaderStatRelease,
  loaderStatVuln,
  sampleData,
} from "./loaders";

const demoEntries: ITimeEntry[] = [...Array(24 * 60).keys()].map((hour) => ({
  time: subHours(endOfToday(), hour),
  count:
    subHours(endOfToday(), hour).getDay() <= 1
      ? Math.floor(Math.random() * 1.2) // 週末は低頻度にする
      : // 早朝深夜は低頻度にする
        subHours(endOfToday(), hour).getHours() < 7 ||
          subHours(endOfToday(), hour).getHours() > 20
        ? Math.floor(Math.random() * 1.2)
        : // 平日の昼間は高頻度にする
          Math.floor(Math.random() * 5),
}));

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      dataStats: sampleData,
      entries: demoEntries,
      costs: dataChart,
      releases: [],
      workflowUsageCurrentCycleOrg: dataDonut,
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

  const releases = await wasmDb
    .select({
      id: releaseTbl.id,
      title: releaseTbl.title,
      body: releaseTbl.body,
      publishedAt: releaseTbl.publishedAt,
      repositoryId: releaseTbl.repositoryId,
      repositoryName: repositoryTbl.name,
      releaseUrl: releaseTbl.url,
      authorId: releaseTbl.authorId,
      authorName: userTbl.name,
      authorAvatarUrl: userTbl.avatarUrl,
    })
    .from(releaseTbl)
    .leftJoin(repositoryTbl, eq(releaseTbl.repositoryId, repositoryTbl.id))
    .leftJoin(userTbl, eq(releaseTbl.authorId, userTbl.id))
    .orderBy(desc(releaseTbl.publishedAt))
    .limit(5);

  const workflowUsageCurrentCycleOrg = await wasmDb
    .select()
    .from(workflowUsageCurrentCycleOrgTbl)
    // NOTE: 今日の集計結果があるとは限らないためWhere句を削除
    // .where(
    //   and(
    //     gte(workflowUsageCurrentCycleOrgTbl.year, now.getUTCFullYear()),
    //     gte(workflowUsageCurrentCycleOrgTbl.month, now.getUTCMonth() + 1),
    //     gte(workflowUsageCurrentCycleOrgTbl.day, now.getUTCDate()),
    //   ),
    // )
    .orderBy(desc(workflowUsageCurrentCycleOrgTbl.updatedAt))
    .limit(100); // limit today 1 * 100 runnerType

  // 最新の集計結果だけにフィルタリング
  const workflowUsageCurrentCycleOrgFiltered =
    workflowUsageCurrentCycleOrg.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.runnerType === item.runnerType),
    );

  const now = new Date();
  const dailyWorkflowUsageOrgCurrentMonth = await wasmDb
    .select()
    .from(workflowUsageCurrentCycleOrgTbl)
    .where(gte(workflowUsageCurrentCycleOrgTbl.createdAt, subDays(now, 30)))
    .orderBy(asc(workflowUsageCurrentCycleOrgTbl.createdAt));

  const data = [...Array(31).keys()]
    .map((dayBefore) => {
      const targetDate = subDays(now, dayBefore);
      const matchedData = dailyWorkflowUsageOrgCurrentMonth.filter(
        (run) => run.day === targetDate.getDate(),
      );

      return {
        date: targetDate.getDate(),
        value: matchedData.length
          ? matchedData.reduce((acc, run) => acc + run.dollar, 0)
          : null,
      };
    })
    .reverse();

  const entries: ITimeEntry[] = await Promise.all(
    [...Array(24 * 60).keys()].map(async (hour) => ({
      time: subHours(endOfToday(), hour),
      count:
        ((
          await wasmDb
            .select({ count: count() })
            .from(prCommitTbl)
            .where(
              and(
                gte(prCommitTbl.commitAt, subHours(endOfToday(), hour)),
                lt(prCommitTbl.commitAt, subHours(endOfToday(), hour - 1)),
                not(eq(prCommitTbl.authorId, renovateBotId)),
              ),
            )
        )[0]?.count || 0) +
        ((
          await wasmDb
            .select({ count: count() })
            .from(prTbl)
            .where(
              and(
                gte(prTbl.createdAt, subHours(endOfToday(), hour)),
                lt(prTbl.createdAt, subHours(endOfToday(), hour - 1)),
                not(eq(prTbl.authorId, renovateBotId)),
              ),
            )
        )[0]?.count || 0),
    })),
  );

  return {
    entries,
    releases,
    costs: data.map((item, index, self) => {
      // 前日のコストがない場合は差分を計算できない
      const beforeDayCost = self[index - 1]?.value;
      if (beforeDayCost === null) {
        return { ...item, value: null };
      }

      const hasBeforeDayCost = beforeDayCost !== undefined && beforeDayCost > 0;
      if (!hasBeforeDayCost) {
        return { ...item, value: null };
      }

      // コストがない場合は差分を計算できない
      if (item.value === null) {
        return { ...item, value: null };
      }

      // コストが前日よりも小さい場合は、新しい請求サイクルが始まったとみなす
      const hasResetBillingCycle = item.value - beforeDayCost < 0;
      if (hasResetBillingCycle) {
        return { ...item, value: item.value };
      }
      return { ...item, value: item.value - beforeDayCost };
    }),
    workflowUsageCurrentCycleOrg: workflowUsageCurrentCycleOrgFiltered,

    dataStats: [
      await loaderStatPr(wasmDb),
      await loaderStatRelease(wasmDb),
      await loaderStatVuln(wasmDb),
      {
        name: "Change Failure Rate",
        stat: "-",
      },
    ] satisfies StatCardData[],
    daysInCurrentCycle: (
      await wasmDb
        .select()
        .from(billingCycleTbl)
        .orderBy(desc(billingCycleTbl.createdAt))
        .limit(1)
    )[0]?.daysLeft,
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
  { date: "1", value: Math.random() * 100 },
  { date: "2", value: Math.random() * 100 },
  { date: "3", value: Math.random() * 100 },
  { date: "4", value: Math.random() * 100 },
  { date: "5", value: Math.random() * 100 },
  { date: "6", value: Math.random() * 100 },
  { date: "7", value: Math.random() * 100 },
  { date: "8", value: Math.random() * 100 },
  { date: "9", value: Math.random() * 100 },
  { date: "10", value: Math.random() * 100 },
  { date: "11", value: Math.random() * 100 },
  { date: "12", value: Math.random() * 100 },
  { date: "13", value: Math.random() * 100 },
  { date: "14", value: Math.random() * 100 },
  { date: "15", value: Math.random() * 100 },
  { date: "16", value: Math.random() * 100 },
  { date: "17", value: Math.random() * 100 },
  { date: "18", value: Math.random() * 100 },
  { date: "19", value: Math.random() * 100 },
  { date: "20", value: Math.random() * 100 },
  { date: "21", value: Math.random() * 100 },
  { date: "22", value: Math.random() * 100 },
  { date: "23", value: Math.random() * 100 },
  { date: "24", value: Math.random() * 100 },
  { date: "25", value: Math.random() * 100 },
  { date: "26", value: Math.random() * 100 },
  { date: "27", value: Math.random() * 100 },
  { date: "28", value: Math.random() * 100 },
  { date: "29", value: Math.random() * 100 },
  { date: "30", value: Math.random() * 100 },
  { date: "31", value: Math.random() * 100 },
];

const currencyFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

const dataDonut = [
  {
    runnerType: "Ubuntu 16 core",
    dollar: 6730,
  },
  {
    runnerType: "Ubuntu 2 core",
    dollar: 4120,
  },
  {
    runnerType: "Windows 8 core",
    dollar: 3920,
  },
  {
    runnerType: "Windows 32 core",
    dollar: 2120,
  },
];

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const isDemo = params.workspaceId === "demo";

  const {
    entries,
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
            // timeEntries={entries.slice(0, 24 * 30)}
            timeEntries={entries}
            numberOfGroups={10}
            flow
            showGroups={false}
          />,
        );
      }
    })();
  }, [entries]);

  return (
    <>
      <section aria-labelledby="stat-cards">
        <h1 className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
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
            <Card key={item.name} className="py-4 pr-4">
              <dt className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-500">
                {item.name}
                <Tooltip content="Aggregated values for the last 30 days (compared to the same period last month)">
                  <RiQuestionLine size={18} />
                </Tooltip>
              </dt>

              <dd className="mt-2 flex items-baseline space-x-2.5">
                <span className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                  {item.stat}
                </span>
                {item.change && (
                  <span
                    className={cx(
                      item.changeType === "positive"
                        ? "text-emerald-700 dark:text-emerald-500"
                        : "text-red-700 dark:text-red-500",
                      "text-sm font-medium",
                    )}
                  >
                    {item.changeType === "positive" ? "+" : "-"}
                    {item.change}%
                  </span>
                )}
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

      {isDemo && (
        <section aria-labelledby="releases">
          <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            Recent Releases
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
              <li>
                feat(ui): add new UI component to the app by @user in #1210
              </li>
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
      )}

      {!isDemo && (
        <section aria-labelledby="releases">
          <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            Recent Releases
          </h1>

          <p className="mt-1 text-gray-500">
            for more details, click on the links.
          </p>

          {releases.map(
            (release) =>
              release?.releaseUrl && (
                <Card className="mt-6 relative p-0 py-4" key={release.id}>
                  {/*<div className="bg-gradient-to-t from-white via-white/50 to-transparent w-full h-20 absolute bottom-0 z-0" />*/}
                  <div className="px-6 max-h-[14.5rem] overflow-y-hidden ">
                    <h3 className="flex font-semibold text-gray-900 dark:text-gray-50">
                      {release.authorAvatarUrl && (
                        <img
                          src={release.authorAvatarUrl}
                          alt="repository"
                          className="w-12 h-12 rounded-full"
                        />
                      )}

                      <div className="flex justify-center flex-col pl-4">
                        <p>
                          <a
                            href={release.releaseUrl}
                            className="underline underline-offset-4 text-lg"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {release.title}
                          </a>
                        </p>
                        <Link
                          to={`../repositories/${release.repositoryName}`}
                          className="underline underline-offset-4 text-sm text-gray-500"
                        >
                          {release.repositoryName}
                        </Link>
                      </div>
                    </h3>

                    <div className="mt-4 text-sm leading-6 text-gray-900 dark:text-gray-50">
                      <Markdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-md font-bold">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-md font-bold">{children}</h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-6">{children}</ul>
                          ),
                          strong: ({ children }) => (
                            <span className="font-semibold">{children}</span>
                          ),
                        }}
                      >
                        {/* remove html comment */}
                        {release.body?.replaceAll(/<!--[\s\S]*?-->/g, "")}
                      </Markdown>
                    </div>
                  </div>
                </Card>
              ),
          )}
        </section>
      )}
    </>
  );
}
