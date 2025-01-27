import { auth, getWasmDb } from "@/clients";
import { NoDataMessage } from "@/components/ui/no-data";
import { generateDailyData } from "@/lib/generateDailyData";
import type { Route } from "@@/(login)/$workspaceId.users.$userId/+types/page";
import { userTbl } from "@git-dash/db";
import { startOfToday, subDays } from "date-fns";
import { eq } from "drizzle-orm";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { redirect } from "react-router";
import { ActivityTable, Bars, HeatMap, PrTable, Stats } from "./components";
import {
  loaderActivity,
  loaderHeatMap,
  loaderMaxOldPr,
  loaderMaxOldReview,
  loaderPrMerge,
  loaderPrOpen,
  loaderRecentPrs,
  loaderReviews,
  loaderTimeToMerge,
  loaderTimeToReview,
  loaderTimeToReviewed,
  sampleActivity,
  sampleHeatMap,
  sampleRecentPRs,
} from "./loaders";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const isDemo = params.workspaceId === "demo";

  if (isDemo) {
    return {
      user: {
        avatarUrl: "https://i.pravatar.cc/300",
      },
      dataPrOpen: generateDailyData({
        startDate: new Date(
          Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
        ),
        endDate: new Date(),
        min: 1,
        max: 5,
        variance: 1,
        weekendReduction: true,
      }),
      dataPrMerge: generateDailyData({
        startDate: new Date(
          Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
        ),
        endDate: new Date(),
        min: 1,
        max: 5,
        variance: 1,
        weekendReduction: true,
      }),
      dataReviews: generateDailyData({
        startDate: new Date(
          Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
        ),
        endDate: new Date(),
        min: 1,
        max: 15,
        variance: 1,
        weekendReduction: true,
      }),
      activity: sampleActivity,
      heatmap: sampleHeatMap,
      recentPrs: sampleRecentPRs,
    };
  }

  await auth.authStateReady();

  if (!auth.currentUser) {
    throw redirect("/sign-in");
  }

  const token = await auth.currentUser.getIdToken();

  const wasmDb = await getWasmDb({
    workspaceId: params.workspaceId,
    firebaseToken: token,
  });

  if (!wasmDb) return null;

  const user = await wasmDb
    .select()
    .from(userTbl)
    .where(eq(userTbl.login, params.userId))
    .get();
  if (!user) throw Error("User not found");

  return {
    user,
    heatmap: await loaderHeatMap(wasmDb, user.id),
    timeToMerge: await loaderTimeToMerge(wasmDb, user.id),
    timeToReview: await loaderTimeToReview(wasmDb, user.id),
    timeToReviewed: await loaderTimeToReviewed(wasmDb, user.id),
    maxOldPr: await loaderMaxOldPr(wasmDb),
    maxOldReview: await loaderMaxOldReview(wasmDb),
    dataPrOpen: await loaderPrOpen(wasmDb, user.id),
    dataPrMerge: await loaderPrMerge(wasmDb, user.id),
    dataReviews: await loaderReviews(wasmDb, user.id),
    recentPrs: await loaderRecentPrs(wasmDb, user.id),
    activity: await loaderActivity(wasmDb, user.id),
  };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const userName = params.userId;
  const isDemo = params.workspaceId === "demo";
  const loadData = loaderData;
  if (!loadData) return NoDataMessage;

  const {
    user,
    dataPrOpen,
    dataPrMerge,
    dataReviews,
    recentPrs,
    activity,
    heatmap,
    timeToMerge,
    timeToReview,
    timeToReviewed,
    maxOldPr,
    maxOldReview,
  } = loadData;

  console.log(`以下は　ユーザ ${userName} の直近のGithubの活動データです。
あなたは優しく経験豊富で前向きなAIのEMとして以下点を考慮しつつ、このユーザやチームにFBを伝えてください。

- FBは直近7日分をスコープとする(さらにマージまでの時間やレビュー待ち時間は日本時間の土日や深夜早朝を考慮する)
- 具体的なPRについて言及する場合はPRのNumberとタイトルに、GithubのPRに対するリンクをマークダウン的に含める形で記載してください (PRのowner/repository/numberを利用してGithubのPRのURLを合成して下さい)
- このチームはGoogleが提唱するトランクベース開発を行っており、なるべく適切な粒度と頻度で細かくマージしていくことを目標としていることを考慮する
- ある程度適切に目標達成できている場合は、必ずしも追加の改善は必要ないため「今回はいいペースで進んでいるのでこのペースを守りましょう」といったニュアンスのFBをする
- 本人へのFBだけではなく、チームメンバーや人間のEMがこのユーザの開発生産性を向上させるために行動するためのヒントのセクションを設ける
- スプリント最終日のレトロスペクティブの際にチームメンバーや人間のEMが振り返りのディスカッションをするための、レトロスペクティブの議題セクションを設ける
- ワークライフバランスのセクションを追加した上で、活動内容のバランスが取れているかや危険な指標が出ていないがを確認してください

--------------------------
timeToMerge: ${JSON.stringify(timeToMerge, null, 2)},
timeToReview: ${JSON.stringify(timeToReview, null, 2)},
timeToReviewed: ${JSON.stringify(timeToReviewed, null, 2)},
日中の活動(10時〜19時): ${
    heatmap
      .filter(({ count }) => count > 0)
      .filter(({ time }) => subDays(new Date(), 7) < time)
      .filter(({ time }) => 10 <= time.getHours() && time.getHours() <= 19)
      .length
  } 件,
深夜早朝の活動(10時〜19時以外ではあるが社内規定の通常就業時間内): ${
    heatmap
      .filter(({ count }) => count > 0)
      .filter(({ time }) => subDays(new Date(), 7) < time)
      .filter(({ time }) => time.getHours() < 10 || 19 < time.getHours()).length
  } 件,
深夜早朝の残業(朝5時前、または夜22時以降): ${
    heatmap
      .filter(({ count }) => count > 0)
      .filter(({ time }) => subDays(new Date(), 7) < time)
      .filter(({ time }) => time.getHours() < 5 || 22 < time.getHours()).length
  } 件,
recentPrs: ${JSON.stringify(recentPrs, null, 2)},
--------------------------
`);

  console.log(`以下は　ユーザ ${userName} の直近のGithubの活動データです。
このユーザが属するチームは毎日14時頃にデイリースタンドアップMTGを開催しています。
このユーザが今日のデイリーMTGで共有すべき内容を簡単にまとめてください。

- 以下のrecentPrsを利用した上で、日本の土日祝日が考慮された、直近の１営業日以内のデータのみを利用してください (日時はrecentPrsのlastActivityのフィールドを利用してください)
- 具体的なPRについて言及する場合はPRのNumberとタイトルに、GithubのPRに対するリンクをマークダウン的に含める形で記載してください (PRのowner/repository/numberを利用してGithubのPRのURLを合成して下さい)
- やったこと、今日の予定、困っていることの3つのセクションを作ってください

--------------------------
recentPrs: ${JSON.stringify(
    recentPrs.filter(
      ({ lastActivity }) => subDays(new Date(), 4) < lastActivity,
    ),
    null,
    2,
  )},
--------------------------
${" ".repeat(10000)}`);

  const maxDate = startOfToday();
  const [selectedDates, setSelectedDates] = useState<DateRange | undefined>({
    from: subDays(maxDate, 30),
    to: maxDate,
  });

  return (
    <>
      <Bars
        isDemo={isDemo}
        userName={userName}
        avatarUrl={user.avatarUrl}
        timeToMerge={timeToMerge}
        timeToReview={timeToReview}
        timeToReviewed={timeToReviewed}
      />

      <Stats
        maxDate={maxDate}
        selectedDates={selectedDates}
        setSelectedDates={setSelectedDates}
        dataPrOpen={dataPrOpen}
        dataPrMerge={dataPrMerge}
        dataReviews={dataReviews}
      />

      <HeatMap heatMap={heatmap} />

      <ActivityTable
        activity={activity}
        maxOldPr={maxOldPr}
        maxOldReview={maxOldReview}
      />

      <PrTable prs={recentPrs} />
    </>
  );
}
