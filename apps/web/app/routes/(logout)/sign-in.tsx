import { auth } from "@/clients";
import Forms from "@/routes/(logout)/Forms";
import { signInWithEmailAndPassword } from "firebase/auth";
import { redirect } from "react-router";
import type { Route } from "../../../.react-router/types/app/routes/(logout)/+types/sign-in";

export function meta() {
  return [
    { title: "git-dash sign in" },
    { name: "description", content: "Welcome to git-dash" },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const email = formData.get("email");
  if (typeof email !== "string") throw Error("email is invalid");

  const password = formData.get("password");
  if (typeof password !== "string") throw Error("password is invalid");

  await signInWithEmailAndPassword(auth, email, password);
  return redirect("/");
}

export default function Page() {
  return <Forms isSignedIn />;
}
