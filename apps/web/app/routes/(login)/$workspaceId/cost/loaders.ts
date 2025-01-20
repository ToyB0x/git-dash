import type { getWasmDb } from "@/clients";
import { generateDailyData } from "@/lib/generateDailyData";
import { billingCycleTbl } from "@git-dash/db";
import { desc } from "drizzle-orm";

export const sampleActions = [
  {
    runnerType: "Actions2Core",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 12,
      max: 50,
      variance: 0.04,
      weekendReduction: false,
    }),
  },
  {
    runnerType: "Actions4Core",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 20,
      max: 40,
      variance: 0.01,
      weekendReduction: true,
    }),
  },
  {
    runnerType: "Actions16Core",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 30,
      max: 80,
      variance: 0.1,
      weekendReduction: true,
    }),
  },
];

export const loaderDaysInCurrentCycle = async (
  db: NonNullable<Awaited<ReturnType<typeof getWasmDb>>>,
) => {
  const billing = await db
    .select()
    .from(billingCycleTbl)
    .orderBy(desc(billingCycleTbl.createdAt))
    .get();

  return billing?.daysLeft;
};
