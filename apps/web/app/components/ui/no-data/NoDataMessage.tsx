import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RiBarChartFill } from "@remixicon/react";
import { Link } from "react-router";

export const NoDataMessage = (
  <div className="flex justify-center items-center mt-64">
    <Card className="sm:mx-auto sm:max-w-lg text-center p-12 border-dashed flex flex-col space-y-4">
      <RiBarChartFill
        className="mx-auto size-7 text-gray-400 dark:text-gray-600"
        aria-hidden={true}
      />
      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">
        No data available
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Get started by creating a api key <br /> and collect data with{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/marketplace/actions/git-dash-com"
          className="underline underline-offset-4"
        >
          github actions
        </a>
      </p>

      <Button asChild>
        <Link to="../settings/api-key">Move to API Key Setting Page</Link>
      </Button>
    </Card>
  </div>
);
