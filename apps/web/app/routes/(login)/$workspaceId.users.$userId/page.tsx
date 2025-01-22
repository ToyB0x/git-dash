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
import { ActivityTable, Bars, HeatMap, Stats } from "./components";
import {
  loaderActivity,
  loaderHeatMap,
  loaderMaxOldPr,
  loaderMaxOldReview,
  loaderPrMerge,
  loaderPrOpen,
  loaderReviews,
  loaderTimeToMerge,
  loaderTimeToReview,
  loaderTimeToReviewed,
  sampleActivity,
  sampleHeatMap,
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
    activity,
    heatmap,
    timeToMerge,
    timeToReview,
    timeToReviewed,
    maxOldPr,
    maxOldReview,
  } = loadData;

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
    </>
  );
}
