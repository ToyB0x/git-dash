import { dbClient, getOctokit } from "@/clients";
import { logger } from "@/utils";

// NOTE: 企業規模やリポジトリ数によってはかなりのQuotaを消費するため、注意が必要
// ex. 1リポジトリあたり5Action * 100Runs/monthと仮定して、100リポジトリある場合は　5 * 100 * 100 = 5万回 PointsのQuotaが必要
export const aggregate = async (
  orgName: string,
  scanId: number,
  repositories: { id: string; name: string; updatedAt: string }[],
) => {
  const octokit = await getOctokit();

  const billing = await octokit.rest.billing.getGithubActionsBillingOrg({
    org: orgName,
  });
  logger.info(JSON.stringify(billing.data, null, 2));

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  let count = 0;
  for (const repository of repositories) {
    logger.info(
      `Start aggregate:actions-cost ${repository.name} (${++count}/${repositories.length})`,
    );

    const workflows = await octokit.rest.actions.listRepoWorkflows({
      owner: orgName,
      repo: repository.name,
    });

    for (const workflow of workflows.data.workflows) {
      const workflowUsage = await octokit.rest.actions.getWorkflowUsage({
        owner: orgName,
        repo: repository.name,
        workflow_id: workflow.id,
      });

      for (const [runner, { total_ms }] of Object.entries(
        workflowUsage.data.billable,
      )) {
        await dbClient.workflowUsageRepo.create({
          data: {
            scanId,
            runner,
            repositoryId: repository.id,
            workflowId: workflow.id,
            totalMs: total_ms || 0,
          },
        });
      }
    }
  }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data.rate, null, 2));
};
