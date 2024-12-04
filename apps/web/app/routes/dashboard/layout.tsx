import { SidebarProject } from "@repo/ui/SidebarProject";
import { Outlet } from "react-router";
import { auth } from "~/.client";
import type { Route } from "../dashboard/+types/layout";

export async function clientLoader() {
  await auth.authStateReady();
  if (!auth.currentUser && location.pathname !== "/demo") {
    location.href = "/login";
    return { isLoading: true };
  }

  return { isLoading: false };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  // NOTE: prevent flash on redirecting to login page
  const { isLoading } = loaderData;
  if (isLoading) return null;

  return (
    <div className="flex">
      <SidebarProject projectId="demo" />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
