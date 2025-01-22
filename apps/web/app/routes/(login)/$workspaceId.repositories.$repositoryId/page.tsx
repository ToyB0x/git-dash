import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import { sampleActions } from "@/routes/(login)/$workspaceId/cost/loaders";
import type { Route } from "@@/(login)/$workspaceId.repositories.$repositoryId/+types/page";
import { repositoryTbl } from "@git-dash/db";
import { endOfToday, subDays } from "date-fns";
import { eq } from "drizzle-orm";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { redirect } from "react-router";

import {
  ActionsTable,
  ActionsUsageGraph,
  Bars,
  Fourkeys,
  HeatMap,
} from "@/routes/(login)/$workspaceId.repositories.$repositoryId/components";
import {
  demoHeatMap,
  loaderChangeFailureRate,
  loaderChangeLeadTime,
  loaderFailedDeploymentRecoveryTime,
  loaderHeatMap,
  loaderReleases,
  loaderTimeToMerge,
  loaderTimeToReview,
  loaderTimeToReviewed,
  loaderUsageByWorkflowsDaily,
  loaderWorkflowUsageCurrentCycles,
  workflowUsageCurrentCyclesDemo,
} from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  const isDemo = params.workspaceId === "demo";

  if (isDemo) {
    return {
      heatMap: demoHeatMap,
      dataChangeLeadTime: await loaderChangeLeadTime({ isDemo }),
      dataRelease: await loaderReleases({ isDemo }),
      dataChangeFailureRate: await loaderChangeFailureRate(isDemo),
      dataFailedDeploymentRecoveryTime:
        await loaderFailedDeploymentRecoveryTime(isDemo),
      workflowUsageCurrentCycles: workflowUsageCurrentCyclesDemo,
      usageByWorkflowsDaily: sampleActions.map((action) => ({
        usageByWorkflowName: action.runnerType,
        ...action,
      })),
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

  const repo = await wasmDb
    .select()
    .from(repositoryTbl)
    .where(eq(repositoryTbl.name, params.repositoryId))
    .get();

  const repositoryId = repo?.id;
  if (!repositoryId) return null;

  return {
    heatMap: await loaderHeatMap(wasmDb, repositoryId),
    timeToMerge: await loaderTimeToMerge(wasmDb, repositoryId),
    timeToReview: await loaderTimeToReview(wasmDb, repositoryId),
    timeToReviewed: await loaderTimeToReviewed(wasmDb, repositoryId),
    dataChangeLeadTime: await loaderChangeLeadTime({
      isDemo,
      db: wasmDb,
      repositoryId,
    }),
    dataRelease: await loaderReleases({ isDemo, db: wasmDb, repositoryId }),
    dataChangeFailureRate: await loaderChangeFailureRate(isDemo),
    dataFailedDeploymentRecoveryTime:
      await loaderFailedDeploymentRecoveryTime(isDemo),
    workflowUsageCurrentCycles: await loaderWorkflowUsageCurrentCycles(
      wasmDb,
      repositoryId,
    ),
    usageByWorkflowsDaily: await loaderUsageByWorkflowsDaily(
      wasmDb,
      repositoryId,
    ),
  };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const repositoryId = params.repositoryId;
  const isDemo = params.workspaceId === "demo";
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const {
    heatMap,
    timeToMerge,
    timeToReview,
    timeToReviewed,
    dataChangeLeadTime,
    dataRelease,
    dataChangeFailureRate,
    dataFailedDeploymentRecoveryTime,
    workflowUsageCurrentCycles,
    usageByWorkflowsDaily,
  } = loadData;

  const maxDate = endOfToday();
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: subDays(maxDate, 30),
    to: maxDate,
  });

  return (
    <>
      <Bars
        isDemo={isDemo}
        repositoryName={repositoryId}
        timeToMerge={timeToMerge}
        timeToReview={timeToReview}
        timeToReviewed={timeToReviewed}
      />

      <HeatMap heatMap={heatMap} />

      <Fourkeys
        maxDate={maxDate}
        selectedDates={selectedDates}
        setSelectedDates={setSelectedDates}
        dataRelease={dataRelease}
        dataChangeLeadTime={dataChangeLeadTime}
        dataChangeFailureRate={dataChangeFailureRate}
        dataFailedDeploymentRecoveryTime={dataFailedDeploymentRecoveryTime}
      />

      <ActionsUsageGraph
        selectedDates={selectedDates}
        usageByWorkflowsDaily={usageByWorkflowsDaily}
      />

      <ActionsTable workflowUsageCurrentCycles={workflowUsageCurrentCycles} />
    </>
  );
}
