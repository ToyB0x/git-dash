import { auth, hc } from "@/clients";
import { Sidebar } from "@/components/ui/navigation/sidebar";
import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "../../../../.react-router/types/app/routes/(login)/$workspaceId/+types/layout";

type LoginLayoutData = {
  me: {
    email: string;
  };
  workspaces: {
    id: string;
    displayName: string;
    role: string;
  }[];
};

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();

  if (!auth.currentUser) {
    if (params.workspaceId !== "demo") throw redirect("/sign-in");
    return {
      me: {
        email: "demo@example.com",
      },
      workspaces: [
        {
          id: "demo",
          displayName: "Demo Workspace",
          role: "OWNER",
        },
      ],
    };
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

  return {
    me: {
      email: auth.currentUser.email || "",
    },
    workspaces: await workspacesResponse.json(),
  } satisfies LoginLayoutData;
}

export default function Layout() {
  const { me, workspaces } = useLoaderData<typeof clientLoader>();

  return (
    <div className="mx-auto max-w-screen-2xl">
      <Sidebar email={me.email} workspaces={workspaces} />
      <main className="lg:pl-72">
        <div className="relative">
          <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
            <Outlet context={{ workspaces }} />
          </div>
        </div>
      </main>
    </div>
  );
}
