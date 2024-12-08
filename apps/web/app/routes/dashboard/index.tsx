import { Link, redirect } from "react-router";
import { auth } from "~/.client";
import { client } from "~/.client/hono";
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
    publicId: string;
    displayName: string;
  }[];
};

export async function clientLoader() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/login");
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/login");
  }

  const teams = await client.teams.$get(
    {},
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!teams.ok) throw Error("Failed to fetch");

  return {
    teams: await teams.json(),
  } satisfies HomeData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { teams } = loaderData;
  return (
    <ul>
      {teams.map((team) => (
        <li key={team.publicId}>
          <Link to={team.publicId}>{team.displayName}</Link>
        </li>
      ))}
    </ul>
  );
}
