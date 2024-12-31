import { auth, getWasmDb } from "@/clients";
import { SortableTable } from "@/components/ui/SortableTable";
import { NoDataMessage } from "@/components/ui/no-data";
import type { Route } from "@@/(login)/$workspaceId/repository/+types/page";
import { repositoryTbl } from "@repo/db-shared";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { asc } from "drizzle-orm";
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

  const repos = await wasmDb
    .select()
    .from(repositoryTbl)
    .orderBy(asc(repositoryTbl.name));

  return {
    repositories: repos.map((repo) => ({
      ...repo,
      prs: 1,
      reviews: 1,
      releases: 1,
      cost: 1,
      lastActivity: new Date(),
    })),
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
        header: "PRs / month",
        accessorKey: "prs",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: "Reviews / month",
        accessorKey: "reviews",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: "Release / month",
        accessorKey: "releases",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: "Cost / month",
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
          id: "name",
          desc: false,
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
