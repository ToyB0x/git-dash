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
import type { Route } from "@@/(login)/$workspaceId/user/+types/page";
import { prTbl, reviewTbl, userTbl } from "@repo/db-shared";
import { and, eq, gte, sql } from "drizzle-orm";
import { Link, redirect } from "react-router";

const dataTable = [
  {
    id: 1,
    login: "C0d3r",
    name: "John Doe",
    blog: "https://example.com",
    avatarUrl: "https://i.pravatar.cc/300",
    prs: 123,
    reviews: 125,
    lastUpdate: "23/09/2024 13:00",
  },
  {
    id: 2,
    login: "QuickSilver91",
    name: null,
    blog: "https://example2.com",
    avatarUrl: "https://i.pravatar.cc/301",
    prs: 96,
    reviews: 93,
    lastUpdate: "22/09/2024 10:45",
  },
  {
    id: 3,
    login: "Rock3tMan",
    name: "Peter Parker",
    blog: "https://example3.com",
    avatarUrl: "https://i.pravatar.cc/302",
    prs: 66,
    reviews: 53,
    lastUpdate: "22/09/2024 10:45",
  },
  {
    id: 4,
    login: "BananaEat3r",
    name: "Tony Stark",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/303",
    prs: 46,
    reviews: 33,
    lastUpdate: "21/09/2024 14:30",
  },
  {
    id: 5,
    login: "Xg3tt3r",
    name: "Bruce Wayne",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/304",
    prs: 26,
    reviews: 23,
    lastUpdate: "24/09/2024 09:15",
  },
  {
    id: 6,
    login: "Xbox231",
    name: "Clark Kent",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/305",
    prs: 16,
    reviews: 13,
    lastUpdate: "24/09/2024 09:15",
  },
  {
    id: 7,
    login: "WhoAmI",
    name: null,
    blog: null,
    avatarUrl: "https://i.pravatar.cc/306",
    prs: 6,
    reviews: 3,
    lastUpdate: "24/09/2024 09:15",
  },
  {
    id: 8,
    login: "Wat3r",
    name: "Barry Allen",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/307",
    prs: 3,
    reviews: 1,
    lastUpdate: "24/09/2024 09:15",
  },
  {
    id: 9,
    login: "Plat1num",
    name: "Hal Jordan",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/308",
    prs: 1,
    reviews: 0,
    lastUpdate: "24/09/2024 09:15",
  },
  {
    id: 10,
    login: "Gold3n",
    name: null,
    blog: null,
    avatarUrl: "https://i.pravatar.cc/309",
    prs: 1,
    reviews: 0,
    lastUpdate: "24/09/2024 09:15",
  },
  {
    id: 11,
    login: "B1u3",
    name: "Arthur Curry",
    blog: null,
    avatarUrl: "https://i.pravatar.cc/310",
    prs: 1,
    reviews: 0,
    lastUpdate: "24/09/2024 09:15",
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      users: dataTable,
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

  // ref: https://www.answeroverflow.com/m/1095781782856675368
  const users = await wasmDb
    .select({
      id: userTbl.id,
      login: userTbl.login,
      name: userTbl.name,
      blog: userTbl.blog,
      avatarUrl: userTbl.avatarUrl,
      lastUpdate: userTbl.updatedAt,
      // prs: sql<number>`count(${prTbl.authorId})`,
      prs: wasmDb.$count(
        prTbl,
        and(
          eq(userTbl.id, prTbl.authorId),
          gte(prTbl.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
        ),
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
    .where(
      gte(reviewTbl.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    )
    .groupBy(reviewTbl.reviewerId);

  return {
    users: users
      .filter((user) => !user.login.startsWith("renovate"))
      .map((user) => {
        const review = reviews.find((review) => review.userId === user.id);
        return {
          ...user,
          reviews: review?.count ?? 0,
        };
      })
      .sort((a, b) => b.prs - a.prs || a.login.localeCompare(b.login)),
  };
}
export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { users } = loadData;

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
      <TableRoot className="mt-8">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell className="w-1">User</TableHeaderCell>
              <TableHeaderCell />
              <TableHeaderCell className="text-right">
                PRs / month
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Reviews / month
              </TableHeaderCell>
              <TableHeaderCell className="text-right w-1">HP</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="p-0 h-[3.8rem]">
                  <img
                    src={user.avatarUrl}
                    alt="user"
                    className="w-10 h-10 rounded-full"
                  />
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                  <Link
                    to={`${user.login}`}
                    className="underline underline-offset-4"
                  >
                    {user.login} <br />
                  </Link>
                  <span className="text-xs text-gray-500">{user.name}</span>
                </TableCell>
                <TableCell className="text-right">{user.prs}</TableCell>
                <TableCell className="text-right">{user.reviews}</TableCell>
                <TableCell className="text-right">
                  {user.blog && (
                    <a href={user.blog} target="_blank" rel="noreferrer">
                      {user.blog.endsWith("/")
                        ? user.blog
                            .replace("http://", "")
                            .replace("https://", "")
                            .slice(0, -1)
                        : user.blog
                            .replace("http://", "")
                            .replace("https://", "")}
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>
    </section>
  );
}
