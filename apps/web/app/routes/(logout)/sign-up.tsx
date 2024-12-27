import { auth, hc } from "@/clients";
import Forms from "@/routes/(logout)/Forms";
import type { Route } from "@@/(logout)/+types/sign-up";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { redirect } from "react-router";

export function meta() {
  return [
    { title: "git-dash sign up" },
    { name: "description", content: "Welcome to git-dash" },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const email = formData.get("email");
  if (typeof email !== "string") throw Error("email is invalid");

  const password = formData.get("password");
  if (typeof password !== "string") throw Error("password is invalid");

  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  const res = await hc.api.users.$post(
    {},
    {
      headers: {
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
    },
  );

  if (!res.ok) throw Error("Failed to create a user");

  return redirect("/");
}

export default function Page() {
  return <Forms isSignedIn={false} />;
}
