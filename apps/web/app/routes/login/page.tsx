import { signInWithEmailAndPassword } from "firebase/auth";
import { Form } from "react-router";
import { auth } from "~/.client";
import type { Route } from "../login/+types/page";

export async function clientLoader() {
  await auth.authStateReady();

  if (auth.currentUser) {
    location.href = "/";
    return { hasLoggedIn: true };
  }

  return { hasLoggedIn: false };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const email = formData.get("email");
  if (typeof email !== "string") throw Error("email is invalid");

  const password = formData.get("password");
  if (typeof password !== "string") throw Error("password is invalid");

  await signInWithEmailAndPassword(auth, email, password);
  location.href = "/";
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { hasLoggedIn } = loaderData;

  if (hasLoggedIn) return null;

  return (
    <Form method="post" className="flex flex-col">
      <input name="email" type="email" placeholder="email" />
      <input name="password" type="password" placeholder="password" />
      <button type="submit">login</button>
    </Form>
  );
}