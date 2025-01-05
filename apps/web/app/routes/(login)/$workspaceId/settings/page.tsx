import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation";
import { Outlet } from "react-router";

export default function Page() {
  return (
    <>
      <section>
        <TabNavigation>
          <TabNavigationLink href="members" className="px-6">
            Members
          </TabNavigationLink>
          <TabNavigationLink href="api-key" className="px-6">
            API Key
          </TabNavigationLink>
        </TabNavigation>
      </section>
      <section className="mt-6">
        <Outlet />
      </section>
    </>
  );
}
