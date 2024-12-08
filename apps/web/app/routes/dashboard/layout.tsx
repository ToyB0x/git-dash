import { SidebarProject } from "@repo/ui/SidebarProject";
import { Outlet, redirect } from "react-router";
import { auth } from "~/.client";

export async function clientLoader() {
  await auth.authStateReady();
  if (!auth.currentUser && location.pathname !== "/demo") {
    throw redirect("/login");
  }
}

export default function Layout() {
  return (
    <div className="flex">
      <SidebarProject groupId="demo" />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
