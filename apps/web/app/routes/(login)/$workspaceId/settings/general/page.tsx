import { auth, hc } from "@/clients";
import { Button } from "@/components/Button";
import type { Route } from "@@/(login)/$workspaceId/settings/general/+types/page";
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

  const members = await membersResponse.json();

  const isMeOwner = members.some(
    (m) => m.email === auth.currentUser?.email && m.role === "OWNER",
  );

  return {
    isMeOwner,
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { isMeOwner } = loaderData;

  return (
    <div>
      <p className="text-gray-500">Workspace owners can manage configs.</p>

      <section className="flex justify-between mt-8">
        <div>Manage Workspace Name</div>
        <Button disabled={!isMeOwner} className="w-24">
          Update
        </Button>
      </section>

      <section className="flex justify-between mt-8">
        <div>Delete Workspace</div>
        <Button variant="destructive" disabled={!isMeOwner} className="w-24">
          Delete
        </Button>
      </section>
    </div>
  );
}
