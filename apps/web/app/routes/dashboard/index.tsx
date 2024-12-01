import { Skeleton } from "@repo/ui/Skeleton";
import { Button } from "@repo/ui/button";
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
  const isNotAuthorized = true;
  if (isNotAuthorized) {
    return {
      teams: [{ teamId: "demo", teamName: "Demo Team" }],
    } satisfies HomeData;
  }

  return { teams: [] } satisfies HomeData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { teams } = loaderData;
  return (
    <>
      {JSON.stringify(teams)}
      <br />
      <Button appName="home">Click me</Button>
      <br />
      <Skeleton h={32} w={32} />
    </>
  );
}
