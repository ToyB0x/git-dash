import { auth, getWasmDb } from "@/clients";
import { SortableTable } from "@/components/ui/SortableTable";
import { NoDataMessage } from "@/components/ui/no-data";
import type { Route } from "@@/(login)/$workspaceId/fourkey/+types/page";
import { prTbl, releaseTbl, repositoryTbl } from "@git-dash/db";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { subDays } from "date-fns";
import { and, asc, eq, gte } from "drizzle-orm";
import { Link, redirect } from "react-router";

const dataTable = [
  {
    name: "api",
    releases: 124,
    changeLeadTime: 1,
    changeFailureRate: 0.2,
    failedDeploymentRecoveryTime: 1,
  },
  {
    name: "frontend",
    releases: 91,
    changeLeadTime: 2,
    changeFailureRate: 1.1,
    failedDeploymentRecoveryTime: 3,
  },
  {
    name: "payment",
    releases: 61,
    changeLeadTime: 9,
    changeFailureRate: 3.2,
    failedDeploymentRecoveryTime: 6,
  },
  {
    name: "backend",
    releases: 21,
    changeLeadTime: 3,
    changeFailureRate: 0.6,
    failedDeploymentRecoveryTime: 9,
  },
  {
    name: "serviceX",
    releases: 6,
    changeLeadTime: 11,
    changeFailureRate: 0.1,
    failedDeploymentRecoveryTime: 11,
  },
  {
    name: "serviceY",
    releases: 2,
    changeLeadTime: 21,
    changeFailureRate: 0.8,
    failedDeploymentRecoveryTime: 8,
  },
  {
    name: "serviceZ",
    releases: 1,
    changeLeadTime: 17,
    changeFailureRate: 0.9,
    failedDeploymentRecoveryTime: 12,
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      repositories: dataTable,
    };
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: await auth.currentUser.getIdToken(),
  });

  if (!wasmDb) return null;

  const repos = wasmDb.select().from(repositoryTbl).all();
  const releases = wasmDb
    .select()
    .from(releaseTbl)
    .where(gte(releaseTbl.publishedAt, subDays(new Date(), 30)))
    .orderBy(asc(releaseTbl.publishedAt))
    .all();

  return {
    repositories: await Promise.all(
      repos.map(async (repo) => {
        const matchedReleases = releases.filter(
          (release) => repo.id === release.repositoryId,
        );

        const matchedPrs = await wasmDb
          .select()
          .from(prTbl)
          .where(
            and(
              eq(prTbl.repositoryId, repo.id),
              gte(prTbl.mergedAt, subDays(new Date(), 30)),
            ),
          )
          .orderBy(asc(prTbl.mergedAt))
          .all();

        const leadTimes = matchedPrs.map((pr) => {
          const mostClosestRelease = matchedReleases.find(
            (release) =>
              release.publishedAt &&
              pr.mergedAt &&
              release.publishedAt > pr.mergedAt,
          );

          if (!mostClosestRelease) return null;

          return (
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            mostClosestRelease.publishedAt!.getTime() - pr.mergedAt!.getTime()
          );
        });

        const countableLeadTimes = leadTimes.filter(
          (leadTime): leadTime is NonNullable<typeof leadTime> =>
            leadTime !== null,
        );

        const averageLeadTime =
          countableLeadTimes.reduce((acc, leadTime) => acc + leadTime, 0) /
          countableLeadTimes.length;

        return {
          name: repo.name,
          releases: matchedReleases.length,
          changeLeadTime:
            Math.round((10 * averageLeadTime) / (1000 * 60 * 60 * 24)) / 10, // days
          changeFailureRate: 0,
          failedDeploymentRecoveryTime: 0,
        };
      }),
    ),
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { repositories } = loadData;

  if (!repositories.length) {
    return <>データ取得中です</>;
  }

  const table = useReactTable({
    data: repositories,
    columns: [
      {
        header: "Repository",
        accessorKey: "name",
        enableSorting: true,
        meta: {
          headerClassNames: "w-56",
          cellClassNames: "p-0 pr-2 h-[3.8rem]",
        },
        cell: ({ row }) => (
          <div className="font-medium text-gray-900 dark:text-gray-50">
            <Link
              to={`${row.original.name}`}
              className="underline underline-offset-4"
            >
              {row.original.name}
            </Link>
          </div>
        ),
      },
      {
        header: () => (
          <div>
            Deployment Frequency
            <br />
            <span className="text-xs text-gray-500">(30 days)</span>
          </div>
        ),
        accessorKey: "releases",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-center",
          cellClassNames: "text-center",
        },
      },
      {
        header: () => (
          <div>
            Change Lead Time
            <br />
            <span className="text-xs text-gray-500">(30 days)</span>
          </div>
        ),
        accessorKey: "changeLeadTime",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-center",
          cellClassNames: "text-center",
        },
        cell: ({ row }) => (
          <>
            {row.original.changeLeadTime ? (
              `${row.original.changeLeadTime} days`
            ) : (
              <div>
                -<br />
                <span className="text-xs text-gray-500">
                  (No Release / Bot only)
                </span>
              </div>
            )}
          </>
        ),
      },
      {
        header: () => (
          <div>
            Change Failure Rate
            <br />
            <span className="text-xs text-gray-500">(30 days)</span>
          </div>
        ),
        accessorKey: "changeFailureRate",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-center",
          cellClassNames: "text-center",
        },
      },
      {
        header: () => (
          <div>
            Failed Deployment Recovery Time <br />
            <span className="text-xs text-gray-500">(30 days)</span>
          </div>
        ),
        accessorKey: "failedDeploymentRecoveryTime",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-center",
          cellClassNames: "text-center",
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: "releases",
          desc: true,
        },
      ],
    },
  });

  return (
    <>
      <section aria-labelledby="repository-table" className="h-screen">
        <h1
          id="repository-table"
          className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
        >
          Repositories in the workspace
        </h1>
        <p className="mt-1 text-gray-500">
          for more details , click on the repository links.
        </p>

        <div className="mt-2" />
        <SortableTable table={table} />
      </section>
    </>
  );
}
