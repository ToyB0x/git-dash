import { Card } from "@/components/Card";
import { Tooltip } from "@/components/Tooltip";
import { RiQuestionLine } from "@remixicon/react";
import type { FC } from "react";

type Props = {
  daysInCurrentCycle: number;
};

export const Stats: FC<Props> = ({ daysInCurrentCycle }) => (
  <section aria-labelledby="billing-cycle">
    <h1 className="scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
      Billings summary
    </h1>

    <p className="mt-1 text-gray-500">
      for more details, click on the{" "}
      <a
        href="https://docs.github.com/en/billing/using-the-new-billing-platform/about-the-billing-cycle"
        className="underline underline-offset-4"
      >
        Github billing page
      </a>
    </p>

    <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card className="py-4 pr-4">
        <dt className="flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-500">
          <div>Current Billing Cycle</div>
          <Tooltip content="Cost summary will reset on next new billing cycle">
            <RiQuestionLine size={18} />
          </Tooltip>
        </dt>
        <dd className="mt-2 items-baseline space-x-2.5">
          <span className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
            {daysInCurrentCycle}
          </span>
          <span>days left</span>
        </dd>
      </Card>
    </dl>
  </section>
);
