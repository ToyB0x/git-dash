import { Sidebar } from "@/components/ui/navigation/sidebar";
import { useEffect } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <html lang="en" className="antialiased dark:bg-gray-950">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={
          "overflow-y-scroll scroll-auto selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950"
        }
      >
        <div className="mx-auto max-w-screen-2xl">
          <Sidebar />
          <main className="lg:pl-72">{children}</main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // OS の設定が変更された際に実行されるコールバック関数
  // ref: https://azukiazusa.dev/blog/tailwind-css-dark-mode-system-light-dark/
  if (window) {
    const mediaQueryListener = (e: MediaQueryListEvent) => {
      if (localStorage.theme === "system") {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", mediaQueryListener);
  }

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

// ref: https://azukiazusa.dev/blog/tailwind-css-dark-mode-system-light-dark/
const initTheme = () => {
  // LocalStorage に theme が保存されていない or theme が system の場合
  if (!("theme" in localStorage) || localStorage.theme === "system") {
    // OS の設定を読み取る
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // OS の設定がダークモードの場合、<html> に dark クラスを付与する
      document.documentElement.classList.add("dark");
    }
    // LocalStorage に設定を保存する
    localStorage.setItem("theme", "system");
  } else if (localStorage.theme === "dark") {
    // LocalStorage に theme が保存されていて、theme が dark の場合
    document.documentElement.classList.add("dark");
  } else {
    // それ以外の場合
    document.documentElement.classList.remove("dark");
  }
};
