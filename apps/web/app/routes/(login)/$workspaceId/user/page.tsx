import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import { UserTable } from "@/routes/(login)/$workspaceId/user/components";
import type { Route } from "@@/(login)/$workspaceId/user/+types/page";
import { redirect } from "react-router";
import {
  loaderMaxOldPr,
  loaderMaxOldReview,
  loaderUsers,
  sampleUsers,
} from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.workspaceId === "demo") {
    return {
      users: sampleUsers,
    };
  }

  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const token = await auth.currentUser?.getIdToken();

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: token || null,
  });

  if (!wasmDb) return null;

  return {
    users: await loaderUsers(wasmDb),
    maxOldPr: await loaderMaxOldPr(wasmDb),
    maxOldReview: await loaderMaxOldReview(wasmDb),
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const { users, maxOldPr, maxOldReview } = loadData;

  return (
    <UserTable
      users={users}
      maxOldPrCreatedAt={maxOldPr?.createdAt}
      maxOldReviewCreatedAt={maxOldReview?.createdAt}
    />
  );
}
