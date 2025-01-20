import type { getWasmDb } from "@/clients";
import { billingCycleTbl } from "@git-dash/db";
import { desc } from "drizzle-orm";

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
