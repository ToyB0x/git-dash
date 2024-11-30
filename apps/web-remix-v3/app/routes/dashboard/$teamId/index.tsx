import type { Route } from "../../dashboard/$teamId/+types/index";

// biome-ignore lint: remix default setup
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const isNotAuthorized = true;

  const { teamId } = params;
  if (teamId !== "demo" && isNotAuthorized) {
    location.href = "/login";
  }
}

export default function Home() {
  return <div>teamId</div>;
}
