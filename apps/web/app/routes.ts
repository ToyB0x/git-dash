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
  route(":groupId", "routes/(login)/$groupId/layout.tsx", [
    // route("", "routes/(login)/$groupId/overview/page.tsx"),
    // 分析バー: マージまでの時間の平均の階層をCategoryBarCardで表示？
    // 分析バー: レビューの平均待ち時間をCategoryBarCardで表示？
    route("prs", "routes/(login)/$groupId/pr/page.tsx"),
    // グラフ: TOP10 リポジトリごとのGithub Actions費用の前月比グラフ (Overviewページには全リポジトリ横断のコストを表示)
    route("cost", "routes/(login)/$groupId/cost/page.tsx"),
    // グラフ: TOP10 リポジトリごとのPRの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: TOP10 リポジトリごとのPRの最新の5件
    // ランキング: リポジトリ横断のPR数が多いユーザランキング
    // グラフ: リポジトリごとのReviewの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: リポジトリごとのReviewの最新の5件
    // ランキング: リポジトリ横断のPR数が多いユーザランキング
    route("reviews", "routes/(login)/$groupId/review/page.tsx"),
    // グラフ: リポジトリごとのReleasesの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: リポジトリごとのReleasesの最新の5件
    route("releases", "routes/(login)/$groupId/release/page.tsx"),
    // グラフ: リポジトリごとのVulnsの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // グラフ: リポジトリごとのVulnsの危険度がCRITICALの前月比グラフ (Overviewページには全リポジトリ横断のPRを表示)
    // リスト: リポジトリごとのVulnsの最新の5件
    // リスト: リポジトリごとのVulnsの危険度順の5件
    // route("vulns", "routes/(login)/$groupId/vuln/page.tsx"),
    // グラフ: 任意のユーザのコミットグラフ (今月分 + 前月分)
    // グラフ: 任意のユーザのPRグラフ (前月比グラフ)
    // グラフ: 任意のユーザのReviewグラフ (前月比グラフ)
    // route("users", "routes/(login)/$groupId/user/page.tsx"),
    route("home", "routes/(login)/$groupId/home.tsx"),
  ]),

  // logout state layout
  layout("routes/(logout)/layout.tsx", [
    route("sign-in", "routes/(logout)/sign-in.tsx"),
    route("sign-up", "routes/(logout)/sign-up.tsx"),
  ]),
] satisfies RouteConfig;
