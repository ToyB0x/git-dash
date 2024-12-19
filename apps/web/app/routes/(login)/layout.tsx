import { auth, hc } from "@/clients";
import { Sidebar } from "@/components/ui/navigation/sidebar";
import { Outlet, useLoaderData } from "react-router";

// MEMO:
// - 1 user : N organization : M workspaces
// - 1 user : N Invited Organization : M Invited Workspaces

// TODO: add management layout
// in management layout:
// - payment: 1 billing allow multiple workspaces?
// - upgrade plan
// - remove self account
// - add / delete / manage workspace

// in workspace layout:
// - invite / remove users
// - change roles
// - change workspace name

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

export async function clientLoader() {
  await auth.authStateReady();

  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  if (!auth.currentUser) {
    return {
      me: {
        email: "demo@example.com",
      },
      workspaces: [],
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
