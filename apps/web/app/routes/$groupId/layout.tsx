import { auth } from "@/clients";
import { Sidebar } from "@/components/ui/navigation/sidebar";
import { Outlet, redirect } from "react-router";
import type { Route } from "../../../.react-router/types/app/routes/$groupId/+types/layout";

type GroupLayoutData = {
  me: {
    email: string;
  };
};

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await auth.authStateReady();

  if (!auth.currentUser && params.groupId !== "demo") {
    throw redirect("/login");
  }

  return {
    me: {
      email: auth.currentUser?.email ?? "demo@example.com",
    },
  } satisfies GroupLayoutData;
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { me } = loaderData;
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
