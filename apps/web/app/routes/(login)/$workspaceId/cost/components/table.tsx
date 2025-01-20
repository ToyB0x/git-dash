import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import type { FC } from "react";
import { Link } from "react-router";
import type { loaderWorkflowsCost } from "../loaders";

type Props = {
  workflows: Awaited<ReturnType<typeof loaderWorkflowsCost>>;
};

export const ActionsTable: FC<Props> = ({ workflows }) => (
  <section aria-labelledby="high-cost-actions">
    <h1
      id="high-cost-actions"
      className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      Expensive Actions (Current billing cycle)
    </h1>
    <p className="mt-1 text-gray-500">
      for more details, click on the repository links.
    </p>

    <TableRoot className="mt-8">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Repository</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
            <TableHeaderCell>File</TableHeaderCell>
            {/*<TableHeaderCell>Time(min)</TableHeaderCell>*/}
            <TableHeaderCell className="text-right">Costs</TableHeaderCell>
            {/*<TableHeaderCell className="text-right">*/}
            {/*  Last run*/}
            {/*</TableHeaderCell>*/}
          </TableRow>
        </TableHead>
        <TableBody>
          {workflows.map((item) => (
            <TableRow key={item.repoName + item.workflowPath}>
              <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                <Link
                  to={`../repositories/${item.repoName}`}
                  className="underline underline-offset-4"
                >
                  {item.repoName}
                </Link>
              </TableCell>
              <TableCell>{item.workflowName}</TableCell>
              <TableCell>
                {item.workflowPath.replace(".github/workflows/", "")}
              </TableCell>
              {/*<TableCell>{item.time}</TableCell>*/}
              <TableCell className="text-right">${item.cost}</TableCell>
              {/*<TableCell className="text-right">{item.lastRun}</TableCell>*/}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableRoot>
  </section>
);
