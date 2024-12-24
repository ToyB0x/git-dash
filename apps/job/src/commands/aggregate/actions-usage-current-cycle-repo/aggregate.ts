import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { calcActionsCostFromTime, logger } from "@/utils";
import {
  repositoryTbl,
  workflowTbl,
  workflowUsageCurrentCycleTbl,
} from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { eq } from "drizzle-orm";

export const aggregate = async () => {
  const octokit = await getOctokit();

  const workflows = await sharedDbClient
    .select({
      workflowId: workflowTbl.id,
      repositoryName: repositoryTbl.name,
    })
    .from(workflowTbl)
    .innerJoin(repositoryTbl, eq(workflowTbl.repositoryId, repositoryTbl.id));

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  await PromisePool.for(workflows)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (workflow, i) => {
      logger.info(
        `Start aggregate:workflow-cost (${i + 1}/${workflows.length})`,
      );

      const workflowUsage = await octokit.rest.actions.getWorkflowUsage({
        owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
        repo: workflow.repositoryName,
        workflow_id: workflow.workflowId,
      });

      let cost = 0;
      for (const [runnerType, value] of Object.entries(
        workflowUsage.data.billable,
      )) {
        if (!value.total_ms) continue;

        const _cost = calcActionsCostFromTime({
          runner: runnerType,
          milliSec: value.total_ms,
        });

        if (!_cost || !_cost.cost) continue;

        cost += _cost.cost;
      }

      await sharedDbClient
        .insert(workflowUsageCurrentCycleTbl)
        .values({
          id: workflow.workflowId,
          dollar: Math.round(cost * 10) / 10, // round to 1 decimal place
          createdAt: new Date(),
          updatedAt: new Date(), // queryString: "",
        })
        .onConflictDoUpdate({
          target: workflowUsageCurrentCycleTbl.id,
          set: {
            dollar: Math.round(cost * 10) / 10, // round to 1 decimal place
            updatedAt: new Date(),
          },
        });
    });

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data.rate, null, 2));
};
