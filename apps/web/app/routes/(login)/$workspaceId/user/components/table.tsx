import { SortableTable } from "@/components/ui/SortableTable";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { subDays } from "date-fns";
import type { FC } from "react";
import { Link } from "react-router";
import type { User } from "../loaders";

type Props = {
  users: User[];
  maxOldPrCreatedAt: Date | undefined;
  maxOldReviewCreatedAt: Date | undefined;
};

export const UserTable: FC<Props> = ({
  users,
  maxOldPrCreatedAt,
  maxOldReviewCreatedAt,
}) => {
  const table = useReactTable({
    data: users,
    columns: [
      {
        header: "",
        accessorKey: "login",
        enableSorting: false,
        meta: {
          headerClassNames: "w-1",
          cellClassNames: "p-0 pr-2 h-[3.8rem]",
        },
        cell: ({ row }) => (
          <div className="w-10">
            <img
              src={row.original.avatarUrl}
              alt="user"
              className="w-10 h-10 rounded-full"
            />
          </div>
        ),
      },
      {
        header: "User",
        accessorKey: "login",
        enableSorting: true,
        meta: {
          // headerClassNames: "w-1",
        },
        cell: ({ row }) => (
          <div className="font-medium text-gray-900 dark:text-gray-50">
            <Link
              to={`${row.original.login}`}
              className="underline underline-offset-4"
            >
              {row.original.login} <br />
            </Link>
            <span className="text-xs text-gray-500">{row.original.name}</span>
          </div>
        ),
      },
      {
        header: () => (
          <div className="text-center">
            Pull Requests
            <br /> (
            {maxOldPrCreatedAt
              ? `${maxOldPrCreatedAt.toLocaleDateString()}~`
              : `${subDays(new Date(), 180).toLocaleDateString()}~`}
            )
          </div>
        ),
        accessorKey: "prs",
        enableSorting: true,
        meta: {
          headerContentClassNames: "justify-center",
          cellClassNames: "text-center",
        },
      },
      {
        header: () => (
          <div className="text-center">
            Reviews
            <br /> (
            {maxOldReviewCreatedAt
              ? `${maxOldReviewCreatedAt.toLocaleDateString()}~`
              : `${subDays(new Date(), 180).toLocaleDateString()}~`}
            )
          </div>
        ),
        accessorKey: "reviews",
        enableSorting: true,
        meta: {
          headerClassNames: "w-1",
          headerContentClassNames: "justify-center",
          cellClassNames: "text-center",
        },
      },
      {
        header: "HP",
        enableSorting: false,
        meta: {
          headerClassNames: "w-64 text-right",
          cellClassNames: "text-right",
        },
        cell: ({ row }) => {
          const blog = row.original.blog;
          if (!blog) return null;
          return (
            <a
              href={
                blog.startsWith("http") ? blog : `https://${blog}` // ドメインしか入っていない場合
              }
              target="_blank"
              rel="noreferrer"
            >
              {blog.endsWith("/")
                ? blog
                    .replace("http://", "")
                    .replace("https://", "")
                    .slice(0, -1)
                : blog.replace("http://", "").replace("https://", "")}
            </a>
          );
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: "login",
          desc: false,
        },
      ],
    },
  });

  return (
    <section aria-labelledby="users-table" className="h-screen">
      <h1
        id="users-table"
        className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
      >
        Users in repositories
      </h1>
      <p className="mt-1 text-gray-500">
        for more details , click on the user links.
      </p>
      <div className="mt-2" />
      <SortableTable table={table} />
    </section>
  );
};
