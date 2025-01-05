import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation";
import type { LoginLayoutData } from "@/routes/(login)/$workspaceId/layout";
import type { Route } from "@@/(login)/$workspaceId/settings/+types/page";
import { Outlet, useOutletContext } from "react-router";

export default function Page({ params, matches }: Route.ComponentProps) {
  const loginLayoutData = useOutletContext<LoginLayoutData>();

  const isActive = (pathEnd: string) =>
    matches.filter((match) => match?.pathname.endsWith(pathEnd)).length > 0;

  return (
    <>
      <section>
        <TabNavigation>
          <TabNavigationLink
            href={`/${params.workspaceId}/settings/members`}
            active={isActive("members")}
            className="px-6"
          >
            Members
          </TabNavigationLink>
          <TabNavigationLink
            href={`/${params.workspaceId}/settings/api-key`}
            active={isActive("api-key")}
            className="px-6"
          >
            API Key
          </TabNavigationLink>
          <TabNavigationLink
            href={`/${params.workspaceId}/settings/general`}
            active={isActive("general")}
            className="px-6"
          >
            General
          </TabNavigationLink>
        </TabNavigation>
      </section>
      <section className="mt-6">
        <Outlet context={loginLayoutData} />
      </section>
    </>
  );
}
