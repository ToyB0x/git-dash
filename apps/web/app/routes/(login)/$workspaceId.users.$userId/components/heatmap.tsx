import { Card } from "@/components/Card";
import { TimeHeatMap } from "@/components/ui/heatmap";
import { subDays } from "date-fns";
import { type FC, type ReactNode, useEffect, useState } from "react";
import type { loaderHeatMap } from "../loaders";

type Props = {
  heatMap: Awaited<ReturnType<typeof loaderHeatMap>>;
};

export const HeatMap: FC<Props> = ({ heatMap }) => {
  // ref: https://zenn.dev/harukii/articles/a8b0b085b63244
  const [chart, setChart] = useState<ReactNode | null>(null);
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        setChart(
          <TimeHeatMap
            // TODO: windowサイズに合わせリサイズ
            // timeEntries={heatMap.slice(0, 24 * 30)}
            timeEntries={heatMap}
            numberOfGroups={10}
            flow
            showGroups={false}
          />,
        );
      }
    })();
  }, [heatMap]);

  return (
    <section aria-labelledby="commits">
      <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
        User Activity
      </h1>

      <p className="mt-1 text-gray-500">
        The heatmap shows the number of commits and reviews by hour of day.
      </p>

      <Card className="py-4 mt-4 sm:mt-4 lg:mt-6">
        <div className="w-full h-[380px] text-gray-500">{chart}</div>
        <div className="flex justify-between mt-6 text-sm font-medium text-gray-500">
          <span>{subDays(Date.now(), 60).toLocaleDateString()}</span>
          <span>{subDays(Date.now(), 30).toLocaleDateString()}</span>
          <span>{subDays(Date.now(), 0).toLocaleDateString()}</span>
        </div>
      </Card>
    </section>
  );
};
