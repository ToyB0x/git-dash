import { auth } from "@/clients";
import { BarChart } from "@/components/BarChart";
import { Card } from "@/components/Card";
import { DonutChart } from "@/components/DonutChart";
import { cx } from "@/lib/utils";
import { Link, redirect } from "react-router";
import type { Route } from "../../../../../.react-router/types/app/routes/(login)/$workspaceId/+types/layout";

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
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  const isDemo = params.workspaceId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }
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

const currencyFormatter = (number: number) =>
  `$${Intl.NumberFormat("us").format(number).toString()}`;

const dataDonut = [
  {
    name: "Github Actions",
    amount: 6730,
    share: "32.1%",
    color: "bg-blue-500 dark:bg-blue-500",
  },
  {
    name: "Github Team Seats",
    amount: 4120,
    share: "19.6%",
    color: "bg-indigo-500 dark:bg-indigo-500",
  },
  {
    name: "Github Copilots",
    amount: 3920,
    share: "18.6%",
    color: "bg-violet-500 dark:bg-violet-500",
  },
  {
    name: "Others",
    amount: 3210,
    share: "15.3%",
    color: "bg-gray-500",
  },
];

export default function Page() {
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

      <section
        aria-labelledby="summary-graph"
        className="mt-8 scroll-mt-8 grid grid-cols-1 gap-14 sm:grid-cols-2 xl:grid-cols-3"
      >
        <section aria-labelledby="current-cycle-pr" className="col-span-2">
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            Activity
          </h1>

          <p className="mt-1 text-gray-500">
            for more details, check on the{" "}
            <Link to="../prs" className="underline underline-offset-4">
              PRs page
            </Link>
            .
          </p>

          <Card className="mt-4 lg:mt-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-500">
              This month
            </h3>
            <p className="font-semibold text-3xl text-gray-900 dark:text-gray-50">
              421 PRs created
            </p>
            <BarChart
              data={dataChart}
              index="date"
              categories={["This Year"]}
              showLegend={false}
              colors={["blue"]}
              valueFormatter={valueFormatter}
              yAxisWidth={50}
              className="mt-6 hidden h-80 sm:block"
            />
          </Card>
        </section>
        <section aria-labelledby="current-cycle-billing">
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
            Cost
          </h1>

          <p className="mt-1 text-gray-500">
            for more details, check on the{" "}
            <Link to="../cost" className="underline underline-offset-4">
              cost page
            </Link>
            .
          </p>

          <Card className="sm:mx-auto sm:max-w-lg mt-4 lg:mt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Total expenses by category
            </h3>
            <DonutChart
              className="mx-auto mt-6"
              data={dataDonut}
              category="name"
              value="amount"
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
              {dataDonut.slice(0, 4).map((item) => (
                <li
                  key={item.name}
                  className="relative flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span
                      className={cx(item.color, "size-2.5 shrink-0 rounded-sm")}
                      aria-hidden={true}
                    />
                    <span className="truncate dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <p className="flex items-center space-x-2">
                    <span className="font-medium tabular-nums text-gray-900 dark:text-gray-50">
                      {currencyFormatter(item.amount)}
                    </span>
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium tabular-nums text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {item.share}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
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
