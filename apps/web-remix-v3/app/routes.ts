import {
  type RouteConfig,
  layout,
  route,
} from "@react-router/dev/routes";


export default [
  route("login", "routes/login/page.tsx"),

  // dashboard layout
  layout("routes/dashboard/layout.tsx", [
    route("/", "routes/dashboard/index.tsx"),
    route("/:teamId", "routes/dashboard/$teamId/index.tsx"),
  ]),
] satisfies RouteConfig;
