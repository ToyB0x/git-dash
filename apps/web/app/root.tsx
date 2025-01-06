import { auth } from "@/clients";
import { publicViteEnv } from "@/env";
import { onAuthStateChanged } from "firebase/auth";
import LogRocket from "logrocket";
import { ThemeProvider } from "next-themes";
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

if (!location.host.startsWith("localhost")) {
  LogRocket.init(publicViteEnv.VITE_PUBLIC_LOG_ROCKET_ID);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.email || user.uid;
      LogRocket.identify(userId, {
        uid: user.uid,
        email: user.email || "unknown",
      });
    } else {
      // Maybe log rocket can't de-identify user
      // LogRocket.identify(null)
    }
  });
}

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

// ref: https://remix.run/docs/en/main/route/hydrate-fallback
export function HydrateFallback() {
  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // ref: https://zenn.dev/dk_/articles/dd9b0426e58f7d
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Git analysis app" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://git-dash.com" />
        <meta property="og:site_name" content="git-dash" />
        <meta
          property="og:description"
          content="Peter Drucker said, &quot;If you can't measure it, you can't improve it.&quot;&#x0A;Amazingly, once you measure, your organization automatically start improving."
        />
        <Meta />
        <Links />
      </head>
      <body className="antialiased selection:bg-indigo-100 selection:text-indigo-700 dark:bg-gray-950">
        <ThemeProvider defaultTheme="light" attribute="class">
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
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
