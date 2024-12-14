import { auth } from "@/clients";
import { Sidebar } from "@/components/ui/navigation/sidebar";
import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "../../../../.react-router/types/app/routes/(login)/$groupId/+types/layout";

type LoginLayoutData = {
  me: {
    email: string;
  };
};

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  // layoutルートではparamsを扱いにくいため、paramsが絡むリダイレクトはlayoutファイルでは行わない
  await auth.authStateReady();
  if (!auth.currentUser && params.groupId !== "demo") {
    throw redirect("/sign-in");
  }

  return {
    me: {
      email: auth.currentUser?.email ?? "demo@example.com",
    },
  } satisfies LoginLayoutData;
}

export default function Layout() {
  const { me } = useLoaderData<typeof clientLoader>();
  return (
    <div className="mx-auto max-w-screen-2xl">
      <Sidebar email={me.email} />
      <main className="lg:pl-72">
        <div className="relative">
          <div className="p-4 sm:px-6 sm:pb-10 sm:pt-10 lg:px-10 lg:pt-7">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
