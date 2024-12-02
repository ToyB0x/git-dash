import { Skeleton } from "@repo/ui/Skeleton";
import { auth } from "~/.client";
import type { Route } from "../dashboard/+types/index";

// biome-ignore lint: remix default setup
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type HomeData = {
  teams: {
    teamId: string;
    teamName: string;
  }[];
};

export async function clientLoader() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    location.href = "/login";
  }

  return {
    teams: [{ teamId: "demo", teamName: "Demo Team" }],
  } satisfies HomeData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { teams } = loaderData;
  return (
    <>
      {JSON.stringify(teams)}
      <br />
      <Skeleton h={32} w={32} />
    </>
  );
}
