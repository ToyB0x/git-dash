import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import { AlertTable } from "@/routes/(login)/$workspaceId/vuln/components";
import { AlertStats } from "@/routes/(login)/$workspaceId/vuln/components/stats";
import type { Route } from "@@/(login)/$workspaceId/vuln/+types/page";
import { redirect } from "react-router";
import { loaderAlerts, loaderRepositories, sampleAlerts } from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const isDemo = params.workspaceId === "demo";

  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  if (isDemo) {
    return {
      alerts: sampleAlerts,
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
    repositories: await loaderRepositories(wasmDb),
    alerts: await loaderAlerts(wasmDb),
  };
}

// TODO: add PR page
export default function Page({ loaderData, params }: Route.ComponentProps) {
  const isDemo = params.workspaceId === "demo";

  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { alerts, repositories } = loadData;

  return (
    <>
      <AlertStats isDemo={isDemo} alerts={alerts} repositories={repositories} />
      <AlertTable alerts={alerts} />
    </>
  );
}
