import { auth } from "@/clients";
import { redirect } from "react-router";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader() {
  // Root Settings ページはDemoユーザーであってもリダイレクトする (デモユーザの場合はRoot Settingsページへのリンクも非活性化しておく)
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }
}

export default function Home() {
  return <div className="dark:text-white">123</div>;
}
