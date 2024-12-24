import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { calcActionsCostFromTime, logger } from "@/utils";
import { workflowUsageCurrentCycleByRunnerTbl } from "@repo/db-shared";

export const aggregate = async () => {
  const octokit = await getOctokit();

  const billingAction = await octokit.rest.billing.getGithubActionsBillingOrg({
    org: env.GDASH_GITHUB_ORGANIZATION_NAME,
  });
  const billingActionsCost = Object.entries(
    billingAction.data.minutes_used_breakdown,
  ).map(([runner, minutes]) =>
    calcActionsCostFromTime({ runner, milliSec: minutes * 60 * 1000 }),
  );

  for (const usage of billingActionsCost) {
    if (!usage || !usage.cost) continue;

    await sharedDbClient
      .insert(workflowUsageCurrentCycleByRunnerTbl)
      .values({
        runnerType: usage.runner,
        dollar: usage.cost,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: workflowUsageCurrentCycleByRunnerTbl.runnerType,
        set: {
          dollar: usage.cost,
          updatedAt: new Date(),
        },
      });
  }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data.rate, null, 2));
};
