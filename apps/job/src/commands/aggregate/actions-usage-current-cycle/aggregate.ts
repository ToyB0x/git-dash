import { dbClient, getOctokit, sharedDbClient } from "@/clients";
import { calcActionsCostFromTime, logger } from "@/utils";
import { usageCurrentCycleActionOrgTbl } from "@repo/db-shared";

export const aggregate = async (orgName: string, scanId: number) => {
  const octokit = await getOctokit();

  const billingAction = await octokit.rest.billing.getGithubActionsBillingOrg({
    org: orgName,
  });
  const billingActionsCost = Object.entries(
    billingAction.data.minutes_used_breakdown,
  ).map(([runner, minutes]) =>
    calcActionsCostFromTime({ runner, milliSec: minutes * 60 * 1000 }),
  );

  for (const usage of billingActionsCost) {
    if (!usage || !usage.cost) continue;

    // prisma: postgres db
    await dbClient.actionUsageCurrentCycle.create({
      data: {
        scanId,
        runnerType: usage.runner,
        cost: usage.cost,
      },
    });

    // Drizzle: shared db
    await sharedDbClient.insert(usageCurrentCycleActionOrgTbl).values({
      cost: usage.cost,
      runnerType: usage.runner,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data, null, 2));
};
