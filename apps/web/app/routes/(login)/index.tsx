import { auth } from "@/clients";
import { RiAddFill, RiBarChartFill } from "@remixicon/react";
import { redirect, useOutletContext } from "react-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ModalAddWorkspace } from "@/components/ui/navigation/ModalAddWorkspace";

export async function clientLoader() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }
}

export default function Page() {
  const { workspaces } = useOutletContext<{
    workspaces: { id: string; displayName: string; role: string }[];
  }>();

  if (Array.isArray(workspaces) && workspaces.length === 0) {
    return NoWorkspace;
  }

  // TODO: Implement the workspace list UI
  return <pre>{JSON.stringify(workspaces, null, 2)}</pre>;
}

const NoWorkspace = (
  <div className="flex justify-center items-center mt-64">
    <Card className="sm:mx-auto sm:max-w-lg text-center p-12 border-dashed flex flex-col space-y-2">
      <RiBarChartFill
        className="mx-auto size-7 text-gray-400 dark:text-gray-600"
        aria-hidden={true}
      />
      <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">
        No data available
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Get started by creating a workspace
      </p>

      <ModalAddWorkspace>
        <Button className="mt-6">
          <RiAddFill className="-ml-1 size-5 shrink-0" aria-hidden={true} />
          Add workspace
        </Button>
      </ModalAddWorkspace>
    </Card>
  </div>
);
