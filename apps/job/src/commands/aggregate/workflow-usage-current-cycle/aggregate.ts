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

  // NOTE: workflow fileの数だけリクエストを投げるため、ymlファイルが多い場合はQuotaに注意(300ファイルある場合は 300 Pointsも消費してしまう)
  // (Quota節約のため、Workflowファイルが配置されているリポジトリのみチェックする)
  // TODO: 現在はワークフローファイルがなくても今月WorkflowRunがあった場合は集計対象とする(Fileベースではなく、WorkflowRunベースが正しいかもしれない)
  const allWorkflows = await sharedDbClient
    .select({
      workflowId: workflowTbl.id,
      lastAggregatedAt: workflowUsageCurrentCycleTbl.updatedAt,
      repositoryName: repositoryTbl.name,
    })
    .from(workflowTbl)
    .leftJoin(workflowUsageCurrentCycleTbl, eq(workflowTbl.id, workflowUsageCurrentCycleTbl.id))
    .innerJoin(repositoryTbl, eq(workflowTbl.repositoryId, repositoryTbl.id));

  const targetWorkflows = allWorkflows.filter(
    (workflow) => workflow.lastAggregatedAt?.getDate() !== new Date().getDate(), // 既に本日一度でも集計している場合はスキップ
  );

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  await PromisePool.for(targetWorkflows)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (workflow, i) => {
      logger.info(
        `Start aggregate:workflow-usage-current-cycle: (${i + 1}/${targetWorkflows.length})`,
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
};
