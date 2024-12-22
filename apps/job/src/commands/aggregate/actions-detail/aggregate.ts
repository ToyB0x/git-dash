import { dbClient, getOctokit } from "@/clients";
import { logger } from "@/utils";
import { PromisePool } from "@supercharge/promise-pool";

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
  const createdStart = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate().toString().padStart(2, "0")}`;

  // eg: "2024-12-02";
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const createdEnd = `${tomorrow.getFullYear()}-${
    tomorrow.getMonth() + 1
  }-${tomorrow.getDate().toString().padStart(2, "0")}`;

  const queryString = `${createdStart}..${createdEnd}`;

  logger.warn(`fetching created: ${queryString}`);

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
        octokit.rest.actions.listWorkflowRunsForRepo,
        {
          owner: orgName,
          repo: repository.name,
          per_page: 1000,
          created: `${queryString}`,
        },
      );

      const { results, errors } = await PromisePool.for(workflows)
        // parent: 8 , child: 10 = max 80 concurrent requests
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(10)
        .process(async (workflow) => {
          const workflowUsage = await octokit.rest.actions.getWorkflowRunUsage({
            owner: orgName,
            repo: repository.name,
            run_id: workflow.id,
          });

          logger.trace(
            `remain quota ${workflowUsage.headers["x-ratelimit-remaining"]}`,
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
        });
      logger.trace(`inner results: ${results.length}`);
      logger.trace(`inner errors: ${errors.length}`);
    });

  logger.trace(`outer results: ${results.length}`);
  logger.trace(`outer errors: ${errors.length}`);

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data, null, 2));
};
