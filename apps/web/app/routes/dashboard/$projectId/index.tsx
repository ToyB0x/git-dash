import type { StatMergedSchema } from "@repo/schema/statMerged";
import { StatCard } from "@repo/ui/StatCard";
import { BsStar } from "react-icons/bs";
import { GiBiohazard, GiSandsOfTime } from "react-icons/gi";
import { GoCommentDiscussion } from "react-icons/go";
import { IoIosGitPullRequest } from "react-icons/io";
import { SlSpeedometer } from "react-icons/sl";
import { auth } from "~/.client";
import type { Route } from "../../dashboard/$projectId/+types/index";

// biome-ignore lint: remix default setup
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

type DashboardDataV0 = {
  statCards: {
    mergedCount: StatMergedSchema;
    reviewCount: number;
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
  if (params.projectId === "demo") {
    return {
      statCards: {
        mergedCount: {
          teamId: "teamId1",
          reportId: "reportId1",
          type: "statMerged",
          version: "1.0",
          data: [
            { login: "user1", count: 10 },
            { login: "user2", count: 10 },
          ],
        },
        reviewCount: 10,
        waitingCount: 10,
        releaseCount: 10,
        vulnCount: 10,
      },
    } satisfies DashboardDataV0;
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    location.href = "/login";
  }

  // TODO: fetch data from server
  return {
    statCards: {
      mergedCount: {
        teamId: "teamId1",
        reportId: "reportId1",
        type: "statMerged",
        version: "1.0",
        data: [
          { login: "user1", count: 10 },
          { login: "user2", count: 10 },
        ],
      },
      reviewCount: 10,
      waitingCount: 10,
      releaseCount: 10,
      vulnCount: 10,
    },
  } satisfies DashboardDataV0;
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { statCards } = loaderData;
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
        stat={`${statCards.reviewCount}/month`}
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
