import { auth, getWasmDb } from "@/clients";
import { SortableTable } from "@/components/ui/SortableTable";
import { NoDataMessage } from "@/components/ui/no-data";
import type { Route } from "@@/(login)/$workspaceId/user/+types/page";
import { prTbl, reviewTbl, userTbl } from "@git-dash/db";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { subDays } from "date-fns";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import { Link, redirect } from "react-router";

type User = {
  id: number;
  login: string;
  name: string | null;
  blog: string | null;
  avatarUrl: string;
  prs: number;
  reviews: number;
};

const dataTable = [
  {
    id: 1,
    login: "C0d3r",
    name: "John Doe",
    blog: "https://example.com",
    avatarUrl: "https://i.pravatar.cc/300",
    prs: 123,
    reviews: 125,
  },
  {
    id: 2,
    login: "QuickSilver91",
    name: null,
    blog: "https://example2.com",
    avatarUrl: "https://i.pravatar.cc/301",
    prs: 96,
    reviews: 93,
  },
  {
    id: 3,
    login: "Rock3tMan",
    name: "Peter Parker",
    blog: "https://example3.com",
    avatarUrl: "https://i.pravatar.cc/302",
    prs: 66,
    reviews: 53,
  },
  {
    id: 4,
    login: "BananaEat3r",
    name: "Tony Stark",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/303",
    prs: 46,
    reviews: 33,
  },
  {
    id: 5,
    login: "Xg3tt3r",
    name: "Bruce Wayne",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/304",
    prs: 26,
    reviews: 23,
  },
  {
    id: 6,
    login: "Xbox231",
    name: "Clark Kent",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/305",
    prs: 16,
    reviews: 13,
  },
  {
    id: 7,
    login: "WhoAmI",
    name: null,
    blog: null,
    avatarUrl: "https://i.pravatar.cc/306",
    prs: 6,
    reviews: 3,
  },
  {
    id: 8,
    login: "Wat3r",
    name: "Barry Allen",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/307",
    prs: 3,
    reviews: 1,
  },
  {
    id: 9,
    login: "Plat1num",
    name: "Hal Jordan",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/308",
    prs: 1,
    reviews: 0,
  },
  {
    id: 10,
    login: "Gold3n",
    name: null,
    blog: null,
    avatarUrl: "https://i.pravatar.cc/309",
    prs: 1,
    reviews: 0,
  },
  {
    id: 11,
    login: "B1u3",
    name: "Arthur Curry",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/310",
    prs: 1,
    reviews: 0,
  },
] satisfies User[];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      users: dataTable,
    };
  }

  const isSample = params.workspaceId.startsWith("sample-");

  await auth.authStateReady();
  if (!isSample && !auth.currentUser) {
    throw redirect("/sign-in");
  }

  const token = await auth.currentUser?.getIdToken();

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: token || null,
  });

  if (!wasmDb) return null;

  const halfYearAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

  // ref: https://www.answeroverflow.com/m/1095781782856675368
  const users = await wasmDb
    .select({
      id: userTbl.id,
      login: userTbl.login,
      name: userTbl.name,
      blog: userTbl.blog,
      avatarUrl: userTbl.avatarUrl,
      // prs: sql<number>`count(${prTbl.authorId})`,
      prs: wasmDb.$count(
        prTbl,
        and(eq(userTbl.id, prTbl.authorId), gte(prTbl.createdAt, halfYearAgo)),
      ),
    })
    .from(userTbl)
    .leftJoin(prTbl, eq(userTbl.id, prTbl.authorId))
    .groupBy(prTbl.authorId);

  // ref: https://www.answeroverflow.com/m/1095781782856675368
  const reviews = await wasmDb
    .select({
      userId: reviewTbl.reviewerId,
      count: sql<number>`cast(count(${reviewTbl.id}) as int)`,
    })
    .from(reviewTbl)
    .where(gte(reviewTbl.createdAt, halfYearAgo))
    .groupBy(reviewTbl.reviewerId);

  const oldPrs = await wasmDb
    .select()
    .from(prTbl)
    .orderBy(asc(prTbl.createdAt))
    .limit(1);
  const oldReviews = await wasmDb
    .select()
    .from(reviewTbl)
    .orderBy(asc(reviewTbl.createdAt))
    .limit(1);

  const maxOldPr = oldPrs[0];
  const maxOldReview = oldReviews[0];

  return {
    users: users
      .filter((user) => !user.login.startsWith("renovate"))
      .map((user) => {
        const review = reviews.find((review) => review.userId === user.id);
        return {
          ...user,
          reviews: review?.count ?? 0,
        };
      }) satisfies User[],
    maxOldPr,
    maxOldReview,
  };
}
export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { users, maxOldPr, maxOldReview } = loadData;

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
            {maxOldPr
              ? `${maxOldPr.createdAt.toLocaleDateString()}~`
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
            {maxOldReview
              ? `${maxOldReview.createdAt.toLocaleDateString()}~`
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
}
