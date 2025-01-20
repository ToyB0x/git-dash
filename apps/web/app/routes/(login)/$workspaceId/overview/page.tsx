import { auth, getWasmDb } from "@/clients";
import { Card } from "@/components/Card";
import { NoDataMessage } from "@/components/ui/no-data";
import { Costs } from "@/routes/(login)/$workspaceId/overview/components/costs";
import { Stats } from "@/routes/(login)/$workspaceId/overview/components/stats";
import type { Route } from "@@/(login)/$workspaceId/overview/+types/page";
import { subDays } from "date-fns";
import { type ReactNode, useEffect, useState } from "react";
import { Link, redirect } from "react-router";
import { Releases } from "./components";
import {
  type StatCardData,
  loaderCosts,
  loaderDaysInCurrentCycle,
  loaderHeatMaps,
  loaderReleases,
  loaderStatPr,
  loaderStatRelease,
  loaderStatVuln,
  loaderWorkflowUsageCurrentCycleOrg,
  sampleCosts,
  sampleHeatMaps,
  sampleStats,
  sampleWorkflowUsageOrg,
} from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      dataStats: sampleStats,
      heatMaps: sampleHeatMaps,
      costs: sampleCosts,
      releases: [],
      workflowUsageCurrentCycleOrg: sampleWorkflowUsageOrg,
      daysInCurrentCycle: 21,
    };
  }

  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const token = await auth.currentUser.getIdToken();
  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: token,
  });
  if (!wasmDb) return null;

  return {
    heatMaps: await loaderHeatMaps(wasmDb),
    releases: await loaderReleases(wasmDb),
    costs: await loaderCosts(wasmDb),
    daysInCurrentCycle: await loaderDaysInCurrentCycle(wasmDb),
    workflowUsageCurrentCycleOrg:
      await loaderWorkflowUsageCurrentCycleOrg(wasmDb),
    dataStats: [
      await loaderStatPr(wasmDb),
      await loaderStatRelease(wasmDb),
      await loaderStatVuln(wasmDb),
      {
        name: "Change Failure Rate",
        stat: "-",
      },
    ] satisfies StatCardData[],
  };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const isDemo = params.workspaceId === "demo";

  const {
    heatMaps,
    costs,
    releases,
    workflowUsageCurrentCycleOrg,
    dataStats,
    daysInCurrentCycle,
  } = loadData;

  // ref: https://zenn.dev/harukii/articles/a8b0b085b63244
  const [chart, setChart] = useState<ReactNode | null>(null);
  useEffect(() => {
    (async () => {
      if (typeof window !== "undefined") {
        const TimeHeatMap = await import("react-time-heatmap");
        setChart(
          <TimeHeatMap.TimeHeatMap
            // TODO: windowサイズに合わせリサイズ
            // timeEntries={heatMaps.slice(0, 24 * 30)}
            timeEntries={heatMaps}
            numberOfGroups={10}
            flow
            showGroups={false}
          />,
        );
      }
    })();
  }, [heatMaps]);

  return (
    <>
      <Stats dataStats={dataStats} />

      <Costs
        costs={costs}
        daysInCurrentCycle={daysInCurrentCycle}
        workflowUsageCurrentCycleOrg={workflowUsageCurrentCycleOrg}
      />

      <section aria-labelledby="commits">
        <h1 className="mt-8 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50">
          People Activity
        </h1>

        <p className="mt-1 text-gray-500">
          for more details, check on the{" "}
          <Link to="../users" className="underline underline-offset-4">
            users page
          </Link>
          .
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

      {isDemo ? <Releases isDemo /> : <Releases releases={releases} />}
    </>
  );
}
