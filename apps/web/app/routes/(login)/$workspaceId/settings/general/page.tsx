import { auth } from "@/clients";
import { Button } from "@/components/Button";
import type { LoginLayoutData } from "@/routes/(login)/$workspaceId/layout";
import { redirect, useOutletContext } from "react-router";

export async function clientLoader() {
  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }
}

export default function Page() {
  const { me } = useOutletContext<LoginLayoutData>();
  const isMeOwner = me.workspaces.some((w) => w.role === "OWNER");

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
