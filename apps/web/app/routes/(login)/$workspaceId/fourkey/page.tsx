import { auth } from "@/clients";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";

import { Link, redirect } from "react-router";
import type { Route } from "../../../../../.react-router/types/app/routes/(login)/$workspaceId/fourkey/+types/page";

const dataTable = [
  {
    repository: "api",
    prs: 124,
    changeLeadTime: 1,
    changeFailureRate: 0.2,
    failedDeploymentRecoveryTime: 1,
  },
  {
    repository: "org/frontend",
    prs: 91,
    changeLeadTime: 2,
    changeFailureRate: 1.1,
    failedDeploymentRecoveryTime: 3,
  },
  {
    repository: "org/payment",
    prs: 61,
    changeLeadTime: 9,
    changeFailureRate: 3.2,
    failedDeploymentRecoveryTime: 6,
  },
  {
    repository: "org/backend",
    prs: 21,
    changeLeadTime: 3,
    changeFailureRate: 0.6,
    failedDeploymentRecoveryTime: 9,
  },
  {
    repository: "org/serviceX",
    prs: 6,
    changeLeadTime: 11,
    changeFailureRate: 0.1,
    failedDeploymentRecoveryTime: 11,
  },
  {
    repository: "org/serviceY",
    prs: 2,
    changeLeadTime: 21,
    changeFailureRate: 0.8,
    failedDeploymentRecoveryTime: 8,
  },
  {
    repository: "org/serviceZ",
    prs: 1,
    changeLeadTime: 17,
    changeFailureRate: 0.9,
    failedDeploymentRecoveryTime: 12,
  },
];

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await auth.authStateReady();
  const isDemo = params.workspaceId === "demo";
  if (!auth.currentUser && !isDemo) {
    throw redirect("/sign-in");
  }
}

export default function Page() {
  return (
    <section aria-labelledby="four-keys-table" className="h-screen">
      <h1
        id="four-keys-table"
        className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
      >
        Four keys by repository
      </h1>
      <p className="mt-1 text-gray-500">
        for more details graph, click on the repository links.
      </p>
      <TableRoot className="mt-8">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Repository</TableHeaderCell>
              <TableHeaderCell className="text-right">
                Deployment Frequency
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Change Lead Time
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Change Failure Rate
              </TableHeaderCell>
              <TableHeaderCell className="text-right">
                Failed Deployment Recovery Time
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataTable.map((item) => (
              <TableRow key={item.repository}>
                <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                  <Link
                    to={`../repositories/${item.repository}`}
                    className="underline underline-offset-4"
                  >
                    {item.repository}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  {item.prs} releases / month
                </TableCell>
                <TableCell className="text-right">
                  {item.changeLeadTime} hours
                </TableCell>
                <TableCell className="text-right">
                  {item.changeFailureRate} %
                </TableCell>
                <TableCell className="text-right">
                  {item.failedDeploymentRecoveryTime} hours
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>
    </section>
  );
}
