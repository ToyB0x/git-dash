import { Card } from "@/components/Card";
import { Tooltip } from "@/components/Tooltip";
import { cx } from "@/lib/utils";
import { RiQuestionLine } from "@remixicon/react";
import type { FC } from "react";
import { Link } from "react-router";
import type { StatCardData } from "../loaders";

type Props = {
  dataStats: StatCardData[];
};

export const Stats: FC<Props> = ({ dataStats }) => (
  <section aria-labelledby="stat-cards">
    <h1 className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
      Summary
    </h1>

    <p className="mt-1 text-gray-500">
      for more details, click on the{" "}
      <Link to="../fourkeys" className="underline underline-offset-4">
        four keys page
      </Link>{" "}
      /{" "}
      <Link to="../vulns" className="underline underline-offset-4">
        vulns page
      </Link>
      .
    </p>

    <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {dataStats.map((item) => (
        <Card key={item.name} className="py-4 pr-4">
          <dt className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-500">
            {item.name}
            <Tooltip content="Aggregated values for the last 30 days (compared to the same period last month)">
              <RiQuestionLine size={18} />
            </Tooltip>
          </dt>

          <dd className="mt-2 flex items-baseline space-x-2.5">
            <span className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
              {item.stat}
            </span>
            {item.change && (
              <span
                className={cx(
                  item.changeType === "positive"
                    ? "text-emerald-700 dark:text-emerald-500"
                    : "text-red-700 dark:text-red-500",
                  "text-sm font-medium",
                )}
              >
                {item.changeType === "positive" ? "+" : "-"}
                {item.change}%
              </span>
            )}
          </dd>
        </Card>
      ))}
    </dl>
  </section>
);
