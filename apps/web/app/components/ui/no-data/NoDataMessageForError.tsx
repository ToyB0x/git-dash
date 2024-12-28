import { Card } from "@/components/Card";
import { RiBarChartFill } from "@remixicon/react";

export const NoDataMessageForError = () => (
  <div className="flex justify-center items-center mt-64">
    <Card className="sm:mx-auto sm:max-w-lg text-center p-12 border-dashed flex flex-col space-y-4">
      <RiBarChartFill
        className="mx-auto size-7 text-gray-400 dark:text-gray-600"
        aria-hidden={true}
      />
      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">
        Data update in progress
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        The current data may be in an outdated format.
        <br />
        The data will be automatically upgraded the next scan.
        <br />
        (you can also manually run &nbsp;
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/marketplace/actions/git-dash-com"
          className="underline underline-offset-4"
        >
          github actions
        </a>
        &nbsp; to update the data)
      </p>
    </Card>
  </div>
);
