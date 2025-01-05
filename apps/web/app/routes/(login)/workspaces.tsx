import { auth, hc } from "@/clients";
import { redirect, redirectDocument } from "react-router";
import type { Route } from "./+types/workspaces";

// NOTE: add a new workspace
// ref: https://github.com/remix-run/remix/issues/2498
export async function clientAction({ request }: Route.ClientActionArgs) {
  await auth.authStateReady();
  if (!auth.currentUser) throw redirect("/sign-in");

  const formData = await request.formData();

  const workspaceName = formData.get("workspace-name");
  if (typeof workspaceName !== "string")
    throw Error("workspace-name is invalid");

  const res = await hc.api.workspaces.$post(
    {
      json: {
        displayName: workspaceName,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!res.ok) throw Error("Failed to create a workspace");

  const { workspaceId } = await res.json();
  return redirectDocument(`/${workspaceId}/settings/api-key`);
}
