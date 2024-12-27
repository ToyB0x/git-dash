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
import type { Route } from "@@/(login)/$workspaceId/repository/+types/page";
import { repositoryTbl } from "@repo/db-shared";
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
    lastActivity: "23/09/2023 13:00",
  },
  {
    id: 2,
    name: "frontend",
    owner: "org",
    prs: 91,
    reviews: 12,
    releases: 9,
    cost: 1213,
    lastActivity: "22/09/2023 10:45",
  },
  {
    id: 3,
    name: "payment",
    owner: "org",
    prs: 61,
    reviews: 9,
    releases: 6,
    cost: 913,
    lastActivity: "22/09/2023 10:45",
  },
  {
    id: 4,
    name: "backend",
    owner: "org",
    prs: 21,
    reviews: 3,
    releases: 2,
    cost: 541,
    lastActivity: "21/09/2023 14:30",
  },
  {
    id: 5,
    name: "serviceX",
    owner: "org",
    prs: 6,
    reviews: 1,
    releases: 0,
    cost: 213,
    lastActivity: "24/09/2023 09:15",
  },
  {
    id: 6,
    name: "serviceY",
    owner: "org",
    prs: 2,
    reviews: 1,
    releases: 0,
    cost: 113,
    lastActivity: "23/09/2024 21:42",
  },
  {
    id: 7,
    name: "serviceZ",
    owner: "org",
    prs: 1,
    reviews: 1,
    releases: 0,
    cost: 86,
    lastActivity: "21/09/2024 11:32",
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
      <TableRoot className="mt-8">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Repository</TableHeaderCell>
              <TableHeaderCell className="text-right">
                PRs / month
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Reviews / month
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Releases / month
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Cost / month
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Last Activity
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repositories.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                  <Link
                    to={`${item.name}`}
                    className="underline underline-offset-4"
                  >
                    {item.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{item.prs}</TableCell>
                <TableCell className="text-right">{item.reviews}</TableCell>
                <TableCell className="text-right">{item.releases}</TableCell>
                <TableCell className="text-right">${item.cost}</TableCell>
                <TableCell className="text-right">
                  {new Date(item.lastActivity).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>
    </section>
  );
}
