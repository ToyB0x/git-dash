import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // dashboard layout
  route(":groupId", "routes/$groupId/layout.tsx", [
    index("routes/$groupId/home.tsx"),
    route("overview", "routes/$groupId/overview.tsx"),
  ]),

  // logout state layout
  layout("routes/(logout)/layout.tsx", [
    route("login", "routes/(logout)/page.tsx"),
  ]),
] satisfies RouteConfig;
