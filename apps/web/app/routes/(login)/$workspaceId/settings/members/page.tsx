import { auth, hc } from "@/clients";
import type { Route } from "@@/(login)/$workspaceId/settings/members/+types/page";
import { redirect } from "react-router";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const membersResponse = await hc.api.members[":workspaceId"].$get(
    {
      param: {
        workspaceId: params.workspaceId,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!membersResponse.ok) throw Error("Failed to fetch");

  return {
    members: await membersResponse.json(),
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

  return await res.json();
}

export default function Page({ params, loaderData }: Route.ComponentProps) {
  const { members } = loaderData;

  return (
    <ul>
      {members.map((member) => (
        <li key={member.id}>
          <h2>{member.id}</h2>
          <p>{member.email}</p>
        </li>
      ))}
    </ul>
  );
}
