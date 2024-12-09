import { Link, redirect } from "react-router";
import { auth } from "~/.client";
import { client } from "~/.client/hono";
import type { Route } from "../dashboard/+types/index";

// biome-ignore lint: remix default setup
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type HomeData = {
  groups: {
    id: string;
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

  const groups = await client.groups.$get(
    {},
    {
      headers: {
        Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
      },
    },
  );

  if (!groups.ok) throw Error("Failed to fetch");

  return {
    groups: await groups.json(),
  } satisfies HomeData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { groups } = loaderData;
  return (
    <ul>
      {groups.map((group) => (
        <li key={group.id}>
          <Link to={group.id}>{group.displayName}</Link>
        </li>
      ))}
    </ul>
  );
}
