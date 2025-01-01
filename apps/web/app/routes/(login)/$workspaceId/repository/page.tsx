import { auth, getWasmDb } from "@/clients";
import { SortableTable } from "@/components/ui/SortableTable";
import { NoDataMessage } from "@/components/ui/no-data";
import type { Route } from "@@/(login)/$workspaceId/repository/+types/page";
import {
  prTbl,
  releaseTbl,
  repositoryTbl,
  reviewTbl,
  scanTbl,
  workflowUsageCurrentCycleTbl,
} from "@repo/db-shared";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { subDays } from "date-fns";
import { and, desc, eq, gte } from "drizzle-orm";
import { Link, redirect } from "react-router";

const dataTable = [
  {
    id: 1,
    name: "api",
    owner: "org",
    prs: 124,
    reviews: 21,
    releases: 16,
    cost: 3213,
    lastActivity: new Date(),
  },
  {
    id: 2,
    name: "frontend",
    owner: "org",
    prs: 91,
    reviews: 12,
    releases: 9,
    cost: 1213,
    lastActivity: new Date(),
  },
  {
    id: 3,
    name: "payment",
    owner: "org",
    prs: 61,
    reviews: 9,
    releases: 6,
    cost: 913,
    lastActivity: new Date(),
  },
  {
    id: 4,
    name: "backend",
    owner: "org",
    prs: 21,
    reviews: 3,
    releases: 2,
    cost: 541,
    lastActivity: new Date(),
  },
  {
    id: 5,
    name: "serviceX",
    owner: "org",
    prs: 6,
    reviews: 1,
    releases: 0,
    cost: 213,
    lastActivity: new Date(),
  },
  {
    id: 6,
    name: "serviceY",
    owner: "org",
    prs: 2,
    reviews: 1,
    releases: 0,
    cost: 113,
    lastActivity: new Date(),
  },
  {
    id: 7,
    name: "serviceZ",
    owner: "org",
    prs: 1,
    reviews: 1,
    releases: 0,
    cost: 86,
    lastActivity: new Date(),
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
    throw redirect("/login");
  }

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: await auth.currentUser.getIdToken(),
  });

  if (!wasmDb) return null;

  const repos = await wasmDb.select().from(repositoryTbl);
  const latestScans = await wasmDb
    .select()
    .from(scanTbl)
    .orderBy(desc(scanTbl.createdAt))
    .limit(1);
  const lastScan = latestScans[0];

  return {
    repositories: await Promise.all(
      repos.map(async (repo) => ({
        ...repo,
        prs: (
          await wasmDb
            .select()
            .from(prTbl)
            .where(
              and(
                eq(prTbl.repositoryId, repo.id),
                gte(prTbl.createdAt, subDays(new Date(), 30)),
              ),
            )
        ).length,
        reviews: (
          await wasmDb
            .select()
            .from(reviewTbl)
            .where(
              and(
                eq(reviewTbl.repositoryId, repo.id),
                gte(reviewTbl.createdAt, subDays(new Date(), 30)),
              ),
            )
        ).length,
        releases: (
          await wasmDb
            .select()
            .from(releaseTbl)
            .where(
              and(
                eq(releaseTbl.repositoryId, repo.id),
                gte(releaseTbl.publishedAt, subDays(new Date(), 30)),
              ),
            )
        ).length,
        cost: lastScan
          ? (
              await wasmDb
                .select()
                .from(workflowUsageCurrentCycleTbl)
                .where(
                  and(
                    eq(workflowUsageCurrentCycleTbl.repositoryId, repo.id),
                    gte(
                      workflowUsageCurrentCycleTbl.updatedAt,
                      subDays(new Date(), 30),
                    ),
                    eq(workflowUsageCurrentCycleTbl.scanId, lastScan.id),
                  ),
                )
            ).reduce((acc, cur) => acc + cur.dollar, 0)
          : 0,
        lastActivity: repo.updatedAtGithub ?? repo.createdAt,
      })),
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
            PRs
            <br />
            <span className="text-xs text-gray-500">(30 days)</span>
          </div>
        ),
        accessorKey: "prs",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: () => (
          <div>
            Reviews
            <br />
            <span className="text-xs text-gray-500">(30 days)</span>
          </div>
        ),
        accessorKey: "reviews",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: () => (
          <div>
            Release
            <br />
            <span className="text-xs text-gray-500">(30 days)</span>
          </div>
        ),
        accessorKey: "releases",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: () => (
          <div>
            Cost <br />
            <span className="text-xs text-gray-500">(current cycle)</span>
          </div>
        ),
        accessorKey: "cost",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: "Last Activity",
        accessorKey: "lastActivity",
        enableSorting: true,
        cell: ({ row }) => row.original.lastActivity.toLocaleString(),
        meta: {
          headerClassNames: "w-1 pr-0",
          headerContentClassNames: "pr-0 justify-end",
          cellClassNames: "text-right",
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: "prs",
          desc: true,
        },
      ],
    },
  });

  return (
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
  );
}
