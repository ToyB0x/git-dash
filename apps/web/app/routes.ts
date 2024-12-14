import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // login state layout
  layout("routes/(login)/layout.tsx", [
    route("settings", "routes/(login)/settings.tsx"),
    route(":groupId", "routes/(login)/$groupId/layout.tsx", [
      route("home", "routes/(login)/$groupId/home.tsx"),
      route("overview", "routes/(login)/$groupId/overview.tsx"),
    ]),
  ]),

  // logout state layout
  layout("routes/(logout)/layout.tsx", [
    route("login", "routes/(logout)/page.tsx"),
  ]),
] satisfies RouteConfig;
