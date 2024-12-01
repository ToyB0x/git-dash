import { SidebarProject } from "@repo/ui/SidebarProject";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex">
      <SidebarProject projectId="demo" />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
