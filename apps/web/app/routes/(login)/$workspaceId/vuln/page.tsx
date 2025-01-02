import { auth, getWasmDb } from "@/clients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { NoDataMessage } from "@/components/ui/no-data";
import { CategoryBarCard } from "@/components/ui/overview/DashboardCategoryBarCard";
import { CircleProgressCard } from "@/components/ui/overview/DashboardCicleProgressCard";
import {
  dataLoaderVulnerabilityCritical,
  dataLoaderVulnerabilityHigh,
  dataLoaderVulnerabilityLow,
} from "@/routes/(login)/$workspaceId/vuln/dataLoaders";
import type { Route } from "@@/(login)/$workspaceId/vuln/+types/page";
import { alertTbl, repositoryTbl, scanTbl } from "@git-dash/db";
import { isDate } from "date-fns";
import { asc, desc, eq } from "drizzle-orm";
import { Link, redirect } from "react-router";

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

type AlertData = {
  repositoryName: string;
  countCritical: number;
  countHigh: number;
  countMedium: number;
  countLow: number;
  lastDetected: Date | null;
  enabled: boolean | null;
};

const dataTable = [
  {
    repositoryName: "api",
    countCritical: 124,
    countHigh: 21,
    countMedium: 16,
    countLow: 16,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/frontend",
    countCritical: 91,
    countHigh: 12,
    countMedium: 9,
    countLow: 9,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/payment",
    countCritical: 61,
    countHigh: 9,
    countMedium: 6,
    countLow: 6,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/backend",
    countCritical: 21,
    countHigh: 3,
    countMedium: 2,
    countLow: 2,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/serviceX",
    countCritical: 6,
    countHigh: 1,
    countMedium: 1,
    countLow: 0,
    lastDetected: new Date(),
    enabled: true,
  },
  {
    repositoryName: "org/serviceY",
    countCritical: 0,
    countHigh: 0,
    countMedium: 0,
    countLow: 0,
    lastDetected: new Date(),
    enabled: false,
  },
  {
    repositoryName: "org/serviceZ",
    countCritical: 0,
    countHigh: 0,
    countMedium: 0,
    countLow: 0,
    lastDetected: new Date(),
    enabled: false,
  },
] satisfies AlertData[];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const isDemo = params.workspaceId === "demo";
  const dataVulnerabilityCritical =
    await dataLoaderVulnerabilityCritical(isDemo);
  const dataVulnerabilityHigh = await dataLoaderVulnerabilityHigh(isDemo);
  const dataVulnerabilityLow = await dataLoaderVulnerabilityLow(isDemo);

  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  if (isDemo) {
    return {
      dataVulnerabilityCritical,
      dataVulnerabilityHigh,
      dataVulnerabilityLow,
      alerts: dataTable satisfies AlertData[],
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

  const repositories = await wasmDb
    .select()
    .from(repositoryTbl)
    .orderBy(asc(repositoryTbl.name));

  const latestScans = await wasmDb
    .select()
    .from(scanTbl)
    .orderBy(desc(scanTbl.createdAt))
    .limit(1);
  const lastScan = latestScans[0];

  const alertsSummariesByRepo = lastScan
    ? await wasmDb
        .select()
        .from(alertTbl)
        .where(eq(alertTbl.scanId, lastScan.id))
    : [];

  return {
    repositories,
    dataVulnerabilityCritical,
    dataVulnerabilityHigh,
    dataVulnerabilityLow,
    alerts: (await Promise.all(
      alertsSummariesByRepo.map(async (repository) => {
        const matchedRepos = await wasmDb
          .select()
          .from(repositoryTbl)
          .where(eq(repositoryTbl.id, repository.repositoryId))
          .limit(1);

        const repo = matchedRepos[0];
        if (!repo) throw Error("Repository not found");

        return {
          repositoryName: repo.name,
          countCritical: repository.countCritical,
          countHigh: repository.countHigh,
          countMedium: repository.countMedium,
          countLow: repository.countLow,
          lastDetected: repo.enabledAlertCheckedAt,
          enabled: repo.enabledAlert,
        };
      }),
    )) satisfies AlertData[],
  };
}

// TODO: add PR page
export default function Page({ loaderData, params }: Route.ComponentProps) {
  const isDemo = params.workspaceId === "demo";

  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { alerts, repositories } = loadData;

  return (
    <>
      <section aria-labelledby="current-billing-cycle">
        <h1
          id="current-billing-cycle"
          className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Current cycle
        </h1>
        <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
          <CategoryBarCard
            title="Found Vulnerabilities"
            // value="141"
            value={
              isDemo
                ? "141"
                : alerts.reduce(
                    (acc, repo) =>
                      acc +
                      repo.countCritical +
                      repo.countHigh +
                      repo.countMedium +
                      repo.countLow,
                    0,
                  )
            }
            valueDescription="total vulnerabilities"
            subtitle="current result"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            data={
              isDemo
                ? data
                : [
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
                      title: "Medium",
                      percentage: 21.2,
                      value: "16 packages",
                      color: "bg-indigo-600 dark:bg-indigo-500",
                    },
                    {
                      title: "Low",
                      percentage: 41.2,
                      value: "42 packages",
                      color: "bg-gray-400 dark:bg-gray-600",
                    },
                  ].map((item, i) => ({
                    ...item,
                    value: `${alerts.reduce(
                      (acc, repo) =>
                        acc +
                        (i === 0
                          ? repo.countCritical
                          : i === 1
                            ? repo.countHigh
                            : i === 2
                              ? repo.countMedium
                              : repo.countLow),
                      0,
                    )} packages`,
                    percentage:
                      (Math.round(
                        (alerts.reduce(
                          (acc, repo) =>
                            acc +
                            (i === 0
                              ? repo.countCritical
                              : i === 1
                                ? repo.countHigh
                                : i === 2
                                  ? repo.countMedium
                                  : repo.countLow),
                          0,
                        ) /
                          alerts.reduce(
                            (acc, repo) =>
                              acc +
                              repo.countCritical +
                              repo.countHigh +
                              repo.countMedium +
                              repo.countLow,
                            0,
                          )) *
                          1000,
                      ) *
                        100) /
                      1000,
                  }))
            }
          />

          <CircleProgressCard
            title="Analysis enabled Repositories"
            value={
              isDemo
                ? "71 repositoriess"
                : `${repositories?.filter((r) => r.enabledAlert).length} repositories`
            }
            valueDescription="enabled"
            subtitle="GitHub Advisory Database Enabled"
            ctaDescription="About this metrics:"
            ctaText="reference"
            ctaLink="#"
            child={
              isDemo
                ? 71
                : Number(repositories?.filter((r) => r.enabledAlert).length)
            }
            parent={isDemo ? 92 : Number(repositories?.length)}
          />
        </div>
      </section>

      {/*<section aria-labelledby="vulnerabilities-graph">*/}
      {/*  <h1*/}
      {/*    id="vulnerabilities-graph"*/}
      {/*    className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"*/}
      {/*  >*/}
      {/*    Vulnerabilities Stats*/}
      {/*  </h1>*/}
      {/*  <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">*/}
      {/*    <Filterbar*/}
      {/*      maxDate={maxDate}*/}
      {/*      minDate={new Date(2024, 0, 1)}*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      onDatesChange={(dates) => setSelectedDates(dates)}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*  <dl*/}
      {/*    className={cx(*/}
      {/*      "mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",*/}
      {/*    )}*/}
      {/*  >*/}
      {/*    <ChartCard*/}
      {/*      title="Critical Count"*/}
      {/*      type="vulnerabilities"*/}
      {/*      selectedPeriod="last-year"*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      accumulation={false}*/}
      {/*      data={dataVulnerabilityCritical.data}*/}
      {/*    />*/}
      {/*    <ChartCard*/}
      {/*      title="High Count"*/}
      {/*      type="vulnerabilities"*/}
      {/*      selectedPeriod="last-year"*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      accumulation={false}*/}
      {/*      data={dataVulnerabilityHigh.data}*/}
      {/*    />*/}
      {/*    <ChartCard*/}
      {/*      title="Low Count"*/}
      {/*      type="vulnerabilities"*/}
      {/*      selectedPeriod="last-year"*/}
      {/*      selectedDates={selectedDates}*/}
      {/*      accumulation={false}*/}
      {/*      data={dataVulnerabilityLow.data}*/}
      {/*    />*/}
      {/*  </dl>*/}
      {/*</section>*/}

      <section aria-labelledby="vulnerabilities-table">
        <h1
          id="vulnerabilities-table"
          className="mt-12 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Vulnerabilities by repository
        </h1>

        <p className="mt-1 text-gray-500">
          for more details, click on the repository links.
        </p>

        <TableRoot className="mt-2">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Repository</TableHeaderCell>
                <TableHeaderCell className="text-right">
                  Critical
                </TableHeaderCell>
                <TableHeaderCell className="text-right">High</TableHeaderCell>
                <TableHeaderCell className="text-right">Medium</TableHeaderCell>
                <TableHeaderCell className="text-right w-40">
                  Low
                </TableHeaderCell>
                {/*<TableHeaderCell className="text-center">*/}
                {/*  Analysis <br />*/}
                {/*  enabled*/}
                {/*</TableHeaderCell>*/}
                <TableHeaderCell className="text-right">
                  Last detected
                </TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts
                .sort(
                  (a, b) =>
                    (Number.isInteger(b.countCritical)
                      ? Number(b.countCritical)
                      : 0) -
                    (Number.isInteger(a.countCritical)
                      ? Number(a.countCritical)
                      : 0),
                )
                .map((item) => (
                  <TableRow key={item.repositoryName}>
                    <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                      <Link
                        to={`../repositories/${item.repositoryName}`}
                        className="underline underline-offset-4"
                      >
                        {item.repositoryName}
                      </Link>{" "}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.enabled ? item.countCritical : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.enabled ? item.countHigh : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.enabled ? item.countMedium : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.enabled ? item.countLow : "-"}
                    </TableCell>
                    {/*<TableCell className="text-center">*/}
                    {/*  {item.enabled ? "⚪" : "-"}*/}
                    {/*</TableCell>*/}
                    <TableCell className="text-right">
                      {isDate(item.lastDetected)
                        ? item.lastDetected.toLocaleString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableRoot>
      </section>

      {/* prevent menu layout breaking */}
      {isDemo && <div className="h-96" />}
    </>
  );
}
