import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { calcActionsCostFromTime } from "@/utils";
import {
  billingCycleTbl,
  workflowUsageCurrentCycleOrgTbl,
} from "@git-dash/db-shared";

export const aggregate = async (
  scanId: number,
  sharedDbClient: ReturnType<typeof getDbClient>,
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  configs: Configs,
) => {
  const billingStorage = await octokit.rest.billing.getSharedStorageBillingOrg({
    org: configs.GDASH_GITHUB_ORGANIZATION_NAME,
  });

  await sharedDbClient.insert(billingCycleTbl).values({
    scanId,
    daysLeft: billingStorage.data.days_left_in_billing_cycle,
    createdAt: new Date(),
  });

  const billingAction = await octokit.rest.billing.getGithubActionsBillingOrg({
    org: configs.GDASH_GITHUB_ORGANIZATION_NAME,
  });

  const billingActionsCost = Object.entries(
    billingAction.data.minutes_used_breakdown,
  ).map(([runner, minutes]) =>
    calcActionsCostFromTime({ runner, milliSec: minutes * 60 * 1000 }),
  );

  for (const usage of billingActionsCost) {
    if (!usage || !usage.cost) continue;

    const now = new Date();

    await sharedDbClient
      .insert(workflowUsageCurrentCycleOrgTbl)
      .values({
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
        day: now.getUTCDate(),
        runnerType: usage.runner,
        dollar: Math.round(usage.cost * 10) / 10, // round to 1 decimal place
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          workflowUsageCurrentCycleOrgTbl.year,
          workflowUsageCurrentCycleOrgTbl.month,
          workflowUsageCurrentCycleOrgTbl.day,
          workflowUsageCurrentCycleOrgTbl.runnerType,
        ],
        set: {
          dollar: Math.round(usage.cost * 10) / 10, // round to 1 decimal place
          updatedAt: now,
        },
      });
  }
};
