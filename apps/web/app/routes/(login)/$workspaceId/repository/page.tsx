import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import type { Route } from "@@/(login)/$workspaceId/repository/+types/page";
import { RepositoryTable } from "./components";

import { redirect } from "react-router";
import { loaderRepositories, sampleRepositories } from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      repositories: sampleRepositories,
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
    repositories: await loaderRepositories(wasmDb),
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { repositories } = loadData;

  if (!repositories.length) {
    return <>データ取得中です</>;
  }

  return <RepositoryTable repositories={repositories} />;
}
