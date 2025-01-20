import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import {
  loaderDaysInCurrentCycle,
  loaderUsageByRunnerTypes,
  loaderWorkflowsCost,
  sampleActions,
  sampleWorkflows,
} from "@/routes/(login)/$workspaceId/cost/loaders";
import type { Route } from "@@/(login)/$workspaceId/cost/+types/page";
import { redirect } from "react-router";
import { Actions, ActionsTable, Stats } from "./components";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      workflows: sampleWorkflows,
      usageByRunnerTypes: sampleActions,
      daysInCurrentCycle: 21,
    };
  }

  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: await auth.currentUser.getIdToken(),
  });

  if (!wasmDb) return null;

  return {
    daysInCurrentCycle: await loaderDaysInCurrentCycle(wasmDb),
    workflows: await loaderWorkflowsCost(wasmDb),
    usageByRunnerTypes: await loaderUsageByRunnerTypes(wasmDb),
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { workflows, usageByRunnerTypes, daysInCurrentCycle } = loadData;

  return (
    <>
      {daysInCurrentCycle && <Stats daysInCurrentCycle={daysInCurrentCycle} />}

      <Actions usageByRunnerTypes={usageByRunnerTypes} />

      <ActionsTable workflows={workflows} />
    </>
  );
}
