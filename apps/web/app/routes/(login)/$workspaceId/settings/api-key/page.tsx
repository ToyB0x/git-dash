import { auth, hc } from "@/clients";
import type { Route } from "@@/(login)/$workspaceId/settings/api-key/+types/page";
import { Form, redirect, useActionData } from "react-router";

export async function clientAction({ params }: Route.ClientActionArgs) {
  await auth.authStateReady();
  if (!auth.currentUser) throw redirect("/sign-in");

  const { workspaceId } = params;

  const res = await hc.api.workspaces.$patch(
    {
      json: {
        id: workspaceId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!res.ok) throw Error("Failed to create a workspace");

  return (await res.json()).newApiToken;
}

export default function Page({ params }: Route.ComponentProps) {
  const { workspaceId } = params;
  const actionData = useActionData();

  if (!actionData)
    return (
      <Form method="POST">
        <button type="submit" disabled={workspaceId === "demo"}>
          API キーを発行する
        </button>
      </Form>
    );

  return (
    <div>
      <div>
        <h2>API キーが発行されました</h2>
        <p>API キー: {actionData}</p>
        <p>(この画面を閉じた後に再表示することはできません)</p>
      </div>
    </div>
  );
}
