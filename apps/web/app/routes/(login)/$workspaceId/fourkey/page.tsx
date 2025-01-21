import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import { RepositoryTable } from "@/routes/(login)/$workspaceId/fourkey/components";
import type { Route } from "@@/(login)/$workspaceId/fourkey/+types/page";
import { redirect } from "react-router";
import { loaderFourKeys, sampleFourKeys } from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      repositories: sampleFourKeys,
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
    repositories: await loaderFourKeys(wasmDb),
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
