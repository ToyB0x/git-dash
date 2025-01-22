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
import type { loaderWorkflowUsageCurrentCycles } from "../loaders";

type Props = {
  workflowUsageCurrentCycles: Awaited<
    ReturnType<typeof loaderWorkflowUsageCurrentCycles>
  >;
};

export const ActionsTable: FC<Props> = ({ workflowUsageCurrentCycles }) => (
  <section aria-labelledby="actions-cost">
    <h1
      id="actions-cost"
      className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      Latest actions usage{" "}
      <span className="text-sm text-gray-500">(current billing cycle)</span>
    </h1>

    <TableRoot className="mt-8">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Action</TableHeaderCell>
            <TableHeaderCell>Path</TableHeaderCell>
            <TableHeaderCell className="text-right">Costs</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workflowUsageCurrentCycles.map((item) => (
            <TableRow key={item.workflowId}>
              <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                {item.workflowName}
              </TableCell>
              <TableCell>{item.workflowPath}</TableCell>
              <TableCell className="text-right">${item.dollar}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableRoot>
  </section>
);
