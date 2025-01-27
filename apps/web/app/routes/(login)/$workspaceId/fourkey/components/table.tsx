import { SortableTable } from "@/components/ui/SortableTable";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";
import { Link } from "react-router";
import type { loaderFourKeys } from "../loaders";

type Props = {
  repositories: Awaited<ReturnType<typeof loaderFourKeys>>;
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
              // SPA Mode + ダブルタップでリンクを開こうとした場合に相対パスが二重に追加され404になってしまう現象の応急対策としてreloadDocumentを追加
              reloadDocument
              to={`../repositories/${row.original.name}`}
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
