import { dbClient, getOctokit } from "@/clients";
import { logger } from "@/utils";

// NOTE: 企業規模やリポジトリ数によってはかなりのQuotaを消費するため、注意が必要
// ex. 1リポジトリあたり5Action * 100Runs/monthと仮定して、100リポジトリある場合は　5 * 100 * 100 = 5万回 PointsのQuotaが必要なため
// 1日あたりに絞ってレポートを作成する
export const aggregate = async (
  orgName: string,
  scanId: number,
  repositories: { id: string; name: string; updatedAt: string }[],
) => {
  const octokit = await getOctokit();

  // eg: "2024-12-01";
  const now = new Date();
  const createdStart = `>=${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate().toString().padStart(2, "0")}`;

  // eg: "2024-12-02";
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const createdEnd = `>=${tomorrow.getFullYear()}-${
    tomorrow.getMonth() + 1
  }-${tomorrow.getDate().toString().padStart(2, "0")}`;

  const queryString = `${createdStart}..${createdEnd}`;

  logger.warn(`fetching created: ${queryString}`);

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  for (const repository of repositories) {
    logger.info(`Start aggregate:actions-cost ${repository.name}`);
    const iterator = octokit.paginate.iterator(
      octokit.rest.actions.listWorkflowRunsForRepo,
      {
        owner: orgName,
        repo: repository.name,
        per_page: 1000,
        created: `${queryString}`,
      },
    );

    for await (const { data: workflows } of iterator) {
      // TODO: 並列処理により高速化する
      for (const workflow of workflows) {
        const workflowUsage = await octokit.rest.actions.getWorkflowRunUsage({
          owner: orgName,
          repo: repository.name,
          run_id: workflow.id,
        });

        logger.trace(
          `remain quota${workflowUsage.headers["x-ratelimit-remaining"]}`,
        );

        await dbClient.workflowUsageRepoDaily.create({
          data: {
            scanId,
            repositoryId: repository.id,
            workflowId: workflow.id,
            workflowName: workflow.name || "",
            workflowPath: workflow.path,
            queryString,
            totalMs: workflowUsage.data.run_duration_ms || 0,
          },
        });
      }
    }
  }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data, null, 2));
};
