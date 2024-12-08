import { Form, redirect } from "react-router";
import { auth } from "~/.client";
import { client } from "~/.client/hono";
import type { Route } from "../../../../.react-router/types/app/routes/signup/+types/page";

export async function clientLoader() {
  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/login");
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const displayName = formData.get("display-name");
  if (typeof displayName !== "string") throw Error("displayName is invalid");

  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/login");
  }

  const token = await auth.currentUser.getIdToken();

  await client.groups.$post(
    {
      json: {
        displayName,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return redirect("/");
}

export default function Page() {
  return (
    <div>
      <Form method="post" className="flex flex-col">
        <input name="display-name" placeholder="group name" />
        <button type="submit">send</button>
      </Form>
    </div>
  );
}
