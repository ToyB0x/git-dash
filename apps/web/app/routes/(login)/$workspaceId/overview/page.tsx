import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import type { Route } from "@@/(login)/$workspaceId/overview/+types/page";
import { redirect } from "react-router";
import { Costs, HeatMap, Releases, Stats } from "./components";
import {
  type StatCardData,
  loaderCosts,
  loaderDaysInCurrentCycle,
  loaderHeatMaps,
  loaderReleases,
  loaderStatPr,
  loaderStatRelease,
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

  return (
    <>
      <Stats dataStats={dataStats} />

      <Costs
        costs={costs}
        daysInCurrentCycle={daysInCurrentCycle}
        workflowUsageCurrentCycleOrg={workflowUsageCurrentCycleOrg}
      />

      <HeatMap heatMaps={heatMaps} />

      {isDemo ? <Releases isDemo /> : <Releases releases={releases} />}
    </>
  );
}
