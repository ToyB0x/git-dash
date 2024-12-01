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
    mergedCount: number;
    reviewCount: number;
    waitingCount: number;
    releaseCount: number;
    vulnCount: number;
  };
};

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (params.projectId === "demo") {
    return {
      statCards: {
        mergedCount: 10,
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
      mergedCount: 10,
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
        stat={`${statCards.mergedCount}/month`}
        icon={<IoIosGitPullRequest size="3rem" />}
      />

      <StatCard
        title="マージ速度"
        stat={`${Math.round(statCards.mergedCount / (30 - 8))}/day`}
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

      <StatCard
        title="脆弱なパッケージ"
        stat={statCards.vulnCount.toString()}
        icon={<GiBiohazard size="3rem" />}
      />
    </div>
  );
}
