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

  // login layout
  layout("routes/(login)/layout.tsx", [
    route("login", "routes/(login)/page.tsx"),
  ]),
] satisfies RouteConfig;
