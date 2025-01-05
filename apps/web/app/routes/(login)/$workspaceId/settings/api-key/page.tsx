import { auth, hc } from "@/clients";
import { Button } from "@/components/Button";
import { Callout } from "@/components/Callout";
import type { Route } from "@@/(login)/$workspaceId/settings/api-key/+types/page";
import { Form, redirect, useActionData } from "react-router";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const workspacesResponse = await hc.api.workspaces.$get(
    {},
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!workspacesResponse.ok) throw Error("Failed to fetch");

  const workspace = (await workspacesResponse.json()).find(
    (workspace) => workspace.id === params.workspaceId,
  );

  if (!workspace) throw redirect("/404");

  return {
    workspace,
  };
}

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

export default function Page({ params, loaderData }: Route.ComponentProps) {
  const { workspaceId } = params;
  const { workspace } = loaderData;

  const actionData = useActionData();

  if (actionData)
    return (
      <div>
        <Callout title="API key created!" className="mb-4">
          <div className="mb-4 flex flex-col gap-4">
            <p>
              For security reasons, after you close this screen, you will not be
              able to display it again.
              <br />
              (If you forget your API key, you can reissue it.)
            </p>

            <p>
              Your API key is: <br />
              <span className="font-bold">{actionData}</span>
            </p>
          </div>
        </Callout>
      </div>
    );

  if (workspace.hasKey)
    return (
      <div className="flex flex-col gap-4">
        <p>
          Your workspace{" "}
          <span className="font-bold">{workspace.displayName}</span> already has
          an API key.
          <br />
          Do you want to reissue a new API key?
          <br />
          (The old API key will be invalidated)
        </p>

        <Form method="POST">
          <Button type="submit" disabled={workspaceId === "demo"}>
            Re create API Key
          </Button>
        </Form>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <div>
        Workspace <span className="font-bold">{workspace.displayName}</span>{" "}
        does not have an API key yet.
        <br />
        Do you want to create a new API key?
      </div>
      <Form method="POST">
        <Button type="submit" disabled={workspaceId === "demo"}>
          Create API Key
        </Button>
      </Form>
    </div>
  );
}
