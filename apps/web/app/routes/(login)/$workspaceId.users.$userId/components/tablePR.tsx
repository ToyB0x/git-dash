import { SortableTable } from "@/components/ui/SortableTable";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { FC } from "react";

export type PR = {
  owner: string;
  repository: string;
  number: number;
  title: string | null;
  numReview: number;
  numCommit: number;
  timeToMerge: number | null;
  // timeToReady: number | null;
  mergedAt: Date | null;
  lastActivity: Date;
};

type Props = {
  prs: PR[];
};

export const PrTable: FC<Props> = ({ prs }) => {
  const table = useReactTable({
    data: prs,
    columns: [
      // {
      //   header: "PR",
      //   accessorFn: (row) => row.repository + row.number,
      //   enableSorting: true,
      //   meta: {
      //     cellClassNames: "p-0 pr-2 h-[3.8rem]",
      //   },
      //   cell: ({ row }) => (
      //     <div className="font-medium text-gray-900 dark:text-gray-50">
      //       <a
      //         target="_blank"
      //         rel="noreferrer"
      //         className="underline underline-offset-4"
      //         href={`https://github.com/${row.original.owner}/${row.original.repository}/pull/${row.original.number}`}
      //       >
      //         #{row.original.number}
      //         <br />
      //         {row.original.repository}
      //       </a>
      //     </div>
      //   ),
      // },
      {
        header: "Title",
        accessorKey: "title",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1",
          headerContentClassNames: "justify-center",
          cellClassNames: "w-[500px] truncate block",
        },
        cell: ({ row }) => (
          <>
            <a
              target="_blank"
              rel="noreferrer"
              className="text-gray-900 dark:text-gray-50"
              href={`https://github.com/${row.original.owner}/${row.original.repository}/pull/${row.original.number}`}
            >
              {row.original.title}
            </a>
          </>
        ),
      },
      {
        header: "Commits",
        accessorKey: "numCommit",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      {
        header: "Reviews",
        accessorKey: "numReview",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
      },
      // {
      //   header: "Time to Ready",
      //   accessorKey: "timeToReady",
      //   enableSorting: true,
      //   meta: {
      //     headerClassNames: "w-1 text-right",
      //     cellClassNames: "text-center",
      //   },
      // },
      {
        header: "Time to Merge",
        accessorKey: "timeToMerge",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1 text-right",
          cellClassNames: "text-center",
        },
        cell: ({ row }) =>
          row.original.timeToMerge
            ? `${Math.round(row.original.timeToMerge / 1000 / 60 / 60)} hours`
            : "-",
      },
      {
        header: "Last Activity",
        accessorKey: "lastActivity",
        enableSorting: true,
        cell: ({ row }) => row.original.lastActivity.toLocaleDateString(),
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
          id: "lastActivity",
          desc: true,
        },
      ],
    },
  });

  return (
    <section aria-labelledby="pr-table" className="mt-16">
      <h1 className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        Recent 30 PRs (beta)
      </h1>
      <p className="mt-1 text-gray-500">
        for more details , click on the PR links. (open github in new tab)
      </p>

      <div className="mt-2" />
      <SortableTable table={table} />
    </section>
  );
};
