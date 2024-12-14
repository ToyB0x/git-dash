import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // login state layout
  layout("routes/(login)/layout.tsx", [
    index("routes/(login)/index.tsx"),
    route("settings", "routes/(login)/settings.tsx"),
    route(":groupId", "routes/(login)/$groupId/layout.tsx", [
      route("", "routes/(login)/$groupId/overview.tsx"),
      route("cost", "routes/(login)/$groupId/cost.tsx"),
      route("home", "routes/(login)/$groupId/home.tsx"),
    ]),
  ]),

  // logout state layout
  layout("routes/(logout)/layout.tsx", [
    route("sign-in", "routes/(logout)/sign-in.tsx"),
    route("sign-up", "routes/(logout)/sign-up.tsx"),
  ]),
] satisfies RouteConfig;
