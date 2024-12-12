import { signInWithEmailAndPassword } from "firebase/auth";
import { Form, redirect } from "react-router";
import { auth } from "~/.client";
import type { Route } from "../login/+types/page";

export function meta() {
  return [{ title: "Login" }];
}

export async function clientLoader() {
  await auth.authStateReady();

  if (auth.currentUser) {
    return redirect("/");
  }

  return null;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const email = formData.get("email");
  if (typeof email !== "string") throw Error("email is invalid");

  const password = formData.get("password");
  if (typeof password !== "string") throw Error("password is invalid");

  await signInWithEmailAndPassword(auth, email, password);
  redirect("/");
}

export default function Page() {
  return (
    <div>
      <Form method="post" className="flex flex-col">
        <input name="email" type="email" placeholder="email" />
        <input name="password" type="password" placeholder="password" />
        <button type="submit">login</button>
      </Form>

      <div>
        Demoページを見てみる
        <br />
        <a href="/demo">Demo</a>
      </div>
    </div>
  );
}
