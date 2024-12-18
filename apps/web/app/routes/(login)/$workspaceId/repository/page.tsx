import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { Link } from "react-router";

const dataTable = [
  {
    repository: "org/api",
    prs: 124,
    reviews: 21,
    releases: 16,
    cost: 3213,
    lastActivity: "23/09/2023 13:00",
  },
  {
    repository: "org/frontend",
    prs: 91,
    reviews: 12,
    releases: 9,
    cost: 1213,
    lastActivity: "22/09/2023 10:45",
  },
  {
    repository: "org/payment",
    prs: 61,
    reviews: 9,
    releases: 6,
    cost: 913,
    lastActivity: "22/09/2023 10:45",
  },
  {
    repository: "org/backend",
    prs: 21,
    reviews: 3,
    releases: 2,
    cost: 541,
    lastActivity: "21/09/2023 14:30",
  },
  {
    repository: "org/serviceX",
    prs: 6,
    reviews: 1,
    releases: 0,
    cost: 213,
    lastActivity: "24/09/2023 09:15",
  },
  {
    repository: "org/serviceY",
    prs: 2,
    reviews: 1,
    releases: 0,
    cost: 113,
    lastActivity: "23/09/2024 21:42",
  },
  {
    repository: "org/serviceZ",
    prs: 1,
    reviews: 1,
    releases: 0,
    cost: 86,
    lastActivity: "21/09/2024 11:32",
  },
];

export default function Page() {
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
            {dataTable.map((item) => (
              <TableRow key={item.repository}>
                <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                  <Link
                    to={`${item.repository}`}
                    className="underline underline-offset-4"
                  >
                    {item.repository}
                  </Link>
                </TableCell>
                <TableCell className="text-right">{item.prs}</TableCell>
                <TableCell className="text-right">{item.reviews}</TableCell>
                <TableCell className="text-right">{item.releases}</TableCell>
                <TableCell className="text-right">${item.cost}</TableCell>
                <TableCell className="text-right">
                  {item.lastActivity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableRoot>
    </section>
  );
}