import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { isDate } from "date-fns";
import type { FC } from "react";
import { Link } from "react-router";
import type { AlertData } from "../loaders";

type Props = {
  alerts: AlertData[];
};

export const AlertTable: FC<Props> = ({ alerts }) => (
  <section aria-labelledby="vulnerabilities-table">
    <h1
      id="vulnerabilities-table"
      className="mt-12 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      Vulnerabilities by repository
    </h1>

    <p className="mt-1 text-gray-500">
      for more details, click on the repository links.
    </p>

    <TableRoot className="mt-2">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Repository</TableHeaderCell>
            <TableHeaderCell className="text-right">Critical</TableHeaderCell>
            <TableHeaderCell className="text-right">High</TableHeaderCell>
            <TableHeaderCell className="text-right">Medium</TableHeaderCell>
            <TableHeaderCell className="text-right w-40">Low</TableHeaderCell>
            {/*<TableHeaderCell className="text-center">*/}
            {/*  Analysis <br />*/}
            {/*  enabled*/}
            {/*</TableHeaderCell>*/}
            <TableHeaderCell className="text-right">
              Last detected
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts
            .sort(
              (a, b) =>
                (Number.isInteger(b.countCritical)
                  ? Number(b.countCritical)
                  : 0) -
                (Number.isInteger(a.countCritical)
                  ? Number(a.countCritical)
                  : 0),
            )
            .map((item) => (
              <TableRow key={item.repositoryName}>
                <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                  <Link
                    to={`../repositories/${item.repositoryName}`}
                    className="underline underline-offset-4"
                  >
                    {item.repositoryName}
                  </Link>{" "}
                </TableCell>
                <TableCell className="text-right">
                  {item.enabled ? item.countCritical : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {item.enabled ? item.countHigh : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {item.enabled ? item.countMedium : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {item.enabled ? item.countLow : "-"}
                </TableCell>
                {/*<TableCell className="text-center">*/}
                {/*  {item.enabled ? "⚪" : "-"}*/}
                {/*</TableCell>*/}
                <TableCell className="text-right">
                  {isDate(item.lastDetected)
                    ? item.lastDetected.toLocaleString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableRoot>
  </section>
);
