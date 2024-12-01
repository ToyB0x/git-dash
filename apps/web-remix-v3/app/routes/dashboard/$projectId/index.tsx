import { auth } from "~/.client";
import type { Route } from "../../dashboard/$projectId/+types/index";

// biome-ignore lint: remix default setup
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type DashboardData = {
  panelPRs: {
    count: number;
  }[];
};

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.projectId === "demo") {
    return {
      panelPRs: [{ count: 10 }],
    } satisfies DashboardData;
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    location.href = "/login";
  }

  // NOTE: fetch data from server
  // const data = await fetch(`/api/teams/${params.projectId}/dashboard`);
  // return data satisfies DashboardData;
  return {
    panelPRs: [{ count: 0 }],
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { panelPRs } = loaderData;
  return <>panelPRs: {panelPRs[0].count}</>;
}
