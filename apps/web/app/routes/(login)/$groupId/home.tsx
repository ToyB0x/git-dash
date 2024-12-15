import { redirect } from "react-router";

export async function clientLoader() {
  return redirect("overview");
}

export default function Page() {
  return null;
}
