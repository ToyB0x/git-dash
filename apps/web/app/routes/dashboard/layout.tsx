import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex">
      <div className="h-screen  w-36 bg-amber-50">Sidebar</div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
