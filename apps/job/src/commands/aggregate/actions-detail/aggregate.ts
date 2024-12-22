import { getOctokit } from "@/clients";
import { logger } from "@/utils";

// NOTE: 企業規模やリポジトリ数によってはかなりのQuotaを消費するため、注意が必要
// ex. 1リポジトリあたり5Action * 100Runs/monthと仮定して、100リポジトリある場合は　5 * 100 * 100 = 5万回 PointsのQuotaが必要
export const aggregate = async (
  orgName: string,
  repositories: { id: string; name: string; updatedAt: string }[],
) => {
  const octokit = await getOctokit();

  const createdAfter = ">=2024-12-01";
  logger.warn("fetching createdAfter", createdAfter);

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  for (const repository of repositories) {
    logger.info(`Start aggregate:actions-cost ${repository.name}`);
    const iterator = octokit.paginate.iterator(
      octokit.rest.actions.listWorkflowRunsForRepo,
      {
        owner: orgName,
        repo: repository.name,
        per_page: 1000,
        // TODO: use dynamic date
        created: createdAfter,
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
          "remain quota",
          workflowUsage.headers["x-ratelimit-remaining"],
        );

        // TODO: insert db
        // console.log(
        //   workflowUsage.data.run_duration_ms,
        //   workflowUsage.data.billable,
        // );
      }
    }
  }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data, null, 2));
};
