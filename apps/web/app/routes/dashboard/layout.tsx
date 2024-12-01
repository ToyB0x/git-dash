import { SidebarProject } from "@repo/ui/SidebarProject";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex">
      <SidebarProject projectId="demo" />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
