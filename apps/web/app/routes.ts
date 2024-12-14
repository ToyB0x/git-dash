import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // dashboard layout
  layout("routes/(main)/layout.tsx", [
    index("routes/(main)/home.tsx"),
    route("overview", "routes/(main)/overview.tsx"),
  ]),
] satisfies RouteConfig;
