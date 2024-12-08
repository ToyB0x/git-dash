import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/login/page.tsx"),
  route("signup", "routes/signup/page.tsx"),
  route("signout", "routes/signout/page.tsx"),

  // dashboard layout
  layout("routes/dashboard/layout.tsx", [
    route("/", "routes/dashboard/index.tsx"),
    route("/new", "routes/dashboard/new/index.tsx"),
    route("/:projectId", "routes/dashboard/$projectId/index.tsx"),
  ]),
] satisfies RouteConfig;
