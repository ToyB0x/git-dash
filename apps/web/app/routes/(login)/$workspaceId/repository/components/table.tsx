import { SortableTable } from "@/components/ui/SortableTable";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";
import { Link } from "react-router";
import type { loaderRepositories } from "../loaders";

type Props = {
  repositories: Pick<
    Awaited<ReturnType<typeof loaderRepositories>>[number],
    "id" | "name" | "prs" | "reviews" | "releases" | "cost" | "lastActivity"
  >[];
};

export const RepositoryTable: FC<Props> = ({ repositories }) => {
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
        cell: ({ row }) => `$${row.original.cost.toLocaleString()}`,
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
};
