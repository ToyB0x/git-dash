import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // login state layout (root)
  layout("routes/(login)/layout.tsx", [
    index("routes/(login)/index.tsx"),
    route("settings", "routes/(login)/settings.tsx"),
  ]),

  // login state layout (group)
  route(":workspaceId", "routes/(login)/$workspaceId/layout.tsx", [
    // コミットグラフ: 組織横断のコミットグラフ
    index("routes/(login)/$workspaceId/index.tsx"),
    route("overview", "routes/(login)/$workspaceId/overview/page.tsx"),
    // リポジトリ横断の4key table
    route("fourkeys", "routes/(login)/$workspaceId/fourkey/page.tsx"),
    // 分析バー: マージまでの時間の平均の階層をCategoryBarCardで表示？
    // 分析バー: レビューの平均待ち時間をCategoryBarCardで表示？
    route("prs", "routes/(login)/$workspaceId/pr/page.tsx"),
    // グラフ: TOP10 リポジトリごとのGithub Actions費用の前月比グラフ (Overviewページには全リポジトリ横断のコストを表示)
    route("cost", "routes/(login)/$workspaceId/cost/page.tsx"),
    // グラフ: TOP10 リポジトリごとのPRの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: TOP10 リポジトリごとのPRの最新の5件
    // ランキング: リポジトリ横断のPR数が多いユーザランキング
    // グラフ: リポジトリごとのReviewの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: リポジトリごとのReviewの最新の5件
    // ランキング: リポジトリ横断のPR数が多いユーザランキング
    route("reviews", "routes/(login)/$workspaceId/review/page.tsx"),
    // グラフ: リポジトリごとのReleasesの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: リポジトリごとのReleasesの最新の5件
    route("releases", "routes/(login)/$workspaceId/release/page.tsx"),
    // グラフ: リポジトリごとのVulnsの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // グラフ: リポジトリごとのVulnsの危険度がCRITICALの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: リポジトリごとのVulnsの最新の5件
    // リスト: リポジトリごとのVulnsの危険度順の5件
    route("vulns", "routes/(login)/$workspaceId/vuln/page.tsx"),
    // グラフ: 全ユーザのコミットグラフ (今月分 + 前月分)
    route("users", "routes/(login)/$workspaceId/user/page.tsx"),
    // グラフ: 任意のユーザのPRグラフ (前月比グラフ)
    // グラフ: 任意のユーザのReviewグラフ (前月比グラフ)
    route(
      "users/:userId",
      "routes/(login)/$workspaceId.users.$userId/page.tsx",
    ),
    route("repositories", "routes/(login)/$workspaceId/repository/page.tsx"),
    route(
      "repositories/:orgId/:repositoryId",
      "routes/(login)/$workspaceId.repositories.$repositoryId/page.tsx",
    ),
  ]),

  // logout state layout
  layout("routes/(logout)/layout.tsx", [
    route("sign-in", "routes/(logout)/sign-in.tsx"),
    route("sign-up", "routes/(logout)/sign-up.tsx"),
  ]),
] satisfies RouteConfig;
