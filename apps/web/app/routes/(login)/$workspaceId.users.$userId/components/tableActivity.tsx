import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "@/components/Table";
import { subDays } from "date-fns";
import type { FC } from "react";
import { Link } from "react-router";
import type { Activity, loaderMaxOldPr, loaderMaxOldReview } from "../loaders";

type Props = {
  activity: Activity[];
  maxOldPr: Awaited<ReturnType<typeof loaderMaxOldPr>> | undefined;
  maxOldReview: Awaited<ReturnType<typeof loaderMaxOldReview>> | undefined;
};

export const ActivityTable: FC<Props> = ({
  activity,
  maxOldPr,
  maxOldReview,
}) => (
  <section aria-labelledby="high-cost-actions">
    <h1
      id="high-cost-actions"
      className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
    >
      Activity by repository{" "}
      <span className="text-sm text-gray-500">(recent 6 months)</span>
    </h1>

    <TableRoot className="mt-8">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Repository</TableHeaderCell>
            <TableHeaderCell className="text-center">
              Pull Requests
              <br /> (
              {maxOldPr
                ? `${maxOldPr.createdAt.toLocaleDateString()}~`
                : `${subDays(new Date(), 180).toLocaleDateString()}~`}
              )
            </TableHeaderCell>
            <TableHeaderCell className="text-center">
              Reviews
              <br /> (
              {maxOldReview
                ? `${maxOldReview.createdAt.toLocaleDateString()}~`
                : `${subDays(new Date(), 180).toLocaleDateString()}~`}
              )
            </TableHeaderCell>
            <TableHeaderCell className="text-right">
              Last Activity
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activity.map((item) => (
            <TableRow key={item.repository}>
              <TableCell className="font-medium text-gray-900 dark:text-gray-50">
                <Link
                  to={`../repositories/${item.repository}`}
                  className="underline underline-offset-4"
                >
                  {item.repository}
                </Link>
              </TableCell>
              <TableCell className="text-center">{item.prs}</TableCell>
              <TableCell className="text-center">{item.reviews}</TableCell>
              <TableCell className="text-right">
                {item.lastActivity?.toLocaleString() || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableRoot>
  </section>
);
