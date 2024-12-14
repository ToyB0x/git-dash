import { auth } from "@/clients";
import { redirect } from "react-router";

export async function clientLoader() {
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }
}

export default function Page() {
  return <div>index</div>;
}
