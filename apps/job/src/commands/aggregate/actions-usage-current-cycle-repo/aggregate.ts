import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { calcActionsCostFromTime, logger } from "@/utils";
import { usageCurrentCycleActionRepoTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

export const aggregate = async (
  repositories: { id: string; name: string; updatedAt: string }[],
) => {
  const octokit = await getOctokit();

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  const { results, errors } = await PromisePool.for(repositories)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository, i) => {
      logger.info(
        `Start aggregate:actions-cost ${repository.name} (${i + 1}/${repositories.length})`,
      );

      const workflows = await octokit.paginate(
        octokit.rest.actions.listRepoWorkflows,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 1000,
        },
      );

      const { results, errors } = await PromisePool.for(workflows)
        // parent: 8 , child: 10 = max 80 concurrent requests
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(10)
        .process(async (workflow) => {
          const workflowUsage = await octokit.rest.actions.getWorkflowUsage({
            owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
            repo: repository.name,
            workflow_id: workflow.id,
          });

          for (const [runnerType, value] of Object.entries(
            workflowUsage.data.billable,
          )) {
            if (!value.total_ms) continue;
            const cost = calcActionsCostFromTime({
              runner: runnerType,
              milliSec: value.total_ms,
            });
            if (!cost) continue;

            await sharedDbClient.insert(usageCurrentCycleActionRepoTbl).values({
              runnerType,
              repoName: repository.name,
              workflowName: workflow.name || "",
              workflowPath: workflow.path,
              cost: cost.cost,
              createdAt: new Date(),
              updatedAt: new Date(),
              // queryString: "",
            });
          }
        });
      logger.trace(`inner results: ${results.length}`);
      logger.trace(`inner errors: ${errors.length}`);
    });

  logger.trace(`outer results: ${results.length}`);
  logger.trace(`outer errors: ${errors.length}`);

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data, null, 2));
};
