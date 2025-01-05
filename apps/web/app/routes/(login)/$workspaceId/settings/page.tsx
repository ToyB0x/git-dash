import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation";
import type { Route } from "@@/(login)/+types/settings";
import { Outlet } from "react-router";

export default function Page({ matches }: Route.ComponentProps) {
  const isActive = (pathEnd: string) =>
    matches.filter((match) => match?.pathname.endsWith(pathEnd)).length > 0;

  return (
    <>
      <section>
        <TabNavigation>
          <TabNavigationLink
            href="members"
            active={isActive("members")}
            className="px-6"
          >
            Members
          </TabNavigationLink>
          <TabNavigationLink
            href="api-key"
            active={isActive("api-key")}
            className="px-6"
          >
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
