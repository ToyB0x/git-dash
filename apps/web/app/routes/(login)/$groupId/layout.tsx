import { auth } from "@/clients";
import { Outlet, redirect } from "react-router";
import type { Route } from "../../../../.react-router/types/app/routes/(login)/$groupId/+types/layout";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await auth.authStateReady();
  if (!auth.currentUser && params.groupId !== "demo") {
    throw redirect("/login");
  }
}

export default function Layout() {
  return <Outlet />;
}
