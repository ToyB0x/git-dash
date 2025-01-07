import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation";
import type { LoginLayoutData } from "@/routes/(login)/$workspaceId/layout";
import type { Route } from "@@/(login)/$workspaceId/settings/+types/page";
import { Link, Outlet, useOutletContext } from "react-router";

export default function Page({ params, matches }: Route.ComponentProps) {
  const loginLayoutData = useOutletContext<LoginLayoutData>();

  const isActive = (pathEnd: string) =>
    matches.filter((match) => match?.pathname.endsWith(pathEnd)).length > 0;

  return (
    <>
      <section>
        <TabNavigation>
          <TabNavigationLink
            asChild
            className="px-6"
            active={isActive("members")}
          >
            <Link to={`/${params.workspaceId}/settings/members`}>Members</Link>
          </TabNavigationLink>
          <TabNavigationLink
            asChild
            className="px-6"
            active={isActive("api-key")}
          >
            <Link to={`/${params.workspaceId}/settings/api-key`}>API Key</Link>
          </TabNavigationLink>
          <TabNavigationLink
            asChild
            className="px-6"
            active={isActive("general")}
          >
            <Link to={`/${params.workspaceId}/settings/general`}>General</Link>
          </TabNavigationLink>
        </TabNavigation>
      </section>
      <section className="mt-6">
        <Outlet context={loginLayoutData} />
      </section>
    </>
  );
}
