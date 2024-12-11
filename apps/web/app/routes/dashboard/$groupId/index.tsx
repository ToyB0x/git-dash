import {
  type Schema as StatMergedSchema,
  stat as statMerged,
} from "@repo/schema/statMerged";
import {
  type Schema as StatReviewsSchema,
  stat as statReviews,
} from "@repo/schema/statReviews";
import { StatCard } from "@repo/ui/StatCard";
import { BsStar } from "react-icons/bs";
import { GiBiohazard, GiSandsOfTime } from "react-icons/gi";
import { GoCommentDiscussion } from "react-icons/go";
import { IoIosGitPullRequest } from "react-icons/io";
import { SlSpeedometer } from "react-icons/sl";
import { redirect } from "react-router";
import { auth } from "~/.client";
import type { Route } from "../../dashboard/$groupId/+types/index";
import { fetchReport } from "./fetchers/statMerged";

// biome-ignore lint: remix default setup
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type DashboardDataV0 = {
  statCards: {
    mergedCount: StatMergedSchema | null;
    reviewCount: StatReviewsSchema | null;
    waitingCount: number;
    releaseCount: number;
    vulnCount: number;
  };
};

// 1 panel: 1 inner loader: 1 type definition
// UI側は常に最新バージョンをMainにマージしていき、個別のloaderがJsonを取得できなければUIを半透明にするだけ
// const mergedCountPanelV1 = <div>panel</div>;
// const mergedCountLoaderV1 = async () =>
//   fetch("/path/to/mergedCount/v1/data.json");
// type MergedCountDataV1 = {
//   version: "1.0";
//   count: number;
//   createdAt: string;
// };
// if (data.version !== "1.0") return null;

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.groupId === "demo") {
    return {
      statCards: {
        mergedCount: statMerged.fixture,
        reviewCount: statReviews.fixture,
        waitingCount: 10,
        releaseCount: 10,
        vulnCount: 10,
      },
    } satisfies DashboardDataV0;
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/login");
  }

  const token = await auth.currentUser.getIdToken();
  const fetchMergedStatResult = await fetchReport<StatMergedSchema>(
    token,
    statMerged.type,
    params.groupId,
    statMerged.schema,
  );

  const fetchReviewsStatResult = await fetchReport<StatReviewsSchema>(
    token,
    statReviews.type,
    params.groupId,
    statReviews.schema,
  );

  // TODO: fetch data from server
  return {
    statCards: {
      mergedCount: fetchMergedStatResult.success
        ? fetchMergedStatResult.data
        : null,
      reviewCount: fetchReviewsStatResult.success
        ? fetchReviewsStatResult.data
        : null,
      waitingCount: 10,
      releaseCount: 10,
      vulnCount: 10,
    },
  } satisfies DashboardDataV0;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { statCards } = loaderData;

  if (statCards.mergedCount === null) return <>まだ集計結果がありません</>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
        gap: "1%",
        height: "100px",
      }}
    >
      <StatCard
        title="マージ済みPR"
        stat={`${statCards.mergedCount.data.reduce(
          (acc, user) => acc + user.count,
          0,
        )}/month`}
        icon={<IoIosGitPullRequest size="3rem" />}
      />

      <StatCard
        title="マージ速度"
        stat={`${Math.round(
          statCards.mergedCount.data.reduce(
            (acc, user) => acc + user.count,
            0,
          ) /
            (30 - 8),
        )}/day`}
        icon={<SlSpeedometer size="3rem" />}
      />

      <StatCard
        title="レビュー数"
        stat={
          statCards.reviewCount
            ? `${statCards.reviewCount.data.reduce(
                (acc, user) => acc + user.count,
                0,
              )}/month`
            : "collecting..."
        }
        icon={<GoCommentDiscussion size="3rem" />}
      />

      <StatCard
        title="レビュー待ちPR"
        stat={statCards.waitingCount.toString()}
        icon={<GiSandsOfTime size="3rem" />}
      />

      <StatCard
        title="リリース数"
        stat={`${statCards.releaseCount}/month`}
        icon={<BsStar size="3rem" />}
      />

      <div className="opacity-60">
        <StatCard
          title="脆弱なパッケージ"
          stat="collecting..."
          icon={<GiBiohazard size="3rem" />}
        />
      </div>
    </div>
  );
}
