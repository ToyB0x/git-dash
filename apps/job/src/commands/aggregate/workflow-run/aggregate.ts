import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { calcActionsCostFromTime, logger } from "@/utils";
import { workflowRunTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

// NOTE: 企業規模やリポジトリ数によってはかなりのQuotaを消費するため、注意が必要
// ex. 1リポジトリあたり5Action * 100Runs/monthと仮定して、100リポジトリある場合は　5 * 100 * 100 = 5万回 PointsのQuotaが必要なため
// 1日あたりに絞ってレポートを作成する
export const aggregate = async (
  repositories: { id: number; name: string }[],
) => {
  const octokit = await getOctokit();

  // eg: "2024-12-01";
  const now = new Date();
  const createdEnd = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate().toString().padStart(2, "0")}`;

  // eg: "2024-12-02";
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const createdStart = `${yesterday.getFullYear()}-${
    yesterday.getMonth() + 1
  }-${yesterday.getDate().toString().padStart(2, "0")}`;

  const queryString = `${createdStart}..${createdEnd}`;

  logger.warn(`fetching created: ${queryString}`);

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  await PromisePool.for(repositories)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository, i) => {
      logger.info(
        `Start aggregate:actions-cost ${repository.name} (${i + 1}/${repositories.length})`,
      );

      const workflowRuns = await octokit.paginate(
        octokit.rest.actions.listWorkflowRunsForRepo,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 1000,
          created: `${queryString}`,
          // status: "completed",
          // TODO: 日を跨いで実行中でまだ終了していないActionの取得ができていないため要改善
        },
      );

      await PromisePool.for(workflowRuns)
        // parent: 8 , child: 10 = max 80 concurrent requests
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(10)
        .process(async (workflowRun) => {
          const workflowUsage = await octokit.rest.actions.getWorkflowRunUsage({
            owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
            repo: repository.name,
            run_id: workflowRun.id,
          });

          logger.trace(
            `remain quota ${workflowUsage.headers["x-ratelimit-remaining"]}`,
          );

          let dollar = 0;
          for (const [runnerType, value] of Object.entries(
            workflowUsage.data.billable,
          )) {
            if (!value.total_ms) continue;

            const cost = calcActionsCostFromTime({
              runner: runnerType,
              milliSec: value.total_ms,
            });

            if (!cost || !cost.cost) continue;

            dollar += cost.cost;
          }

          await sharedDbClient
            .insert(workflowRunTbl)
            .values({
              id: workflowRun.id,
              dollar: Math.round(dollar * 10) / 10, // round to 1 decimal place
              createdAt: new Date(workflowRun.created_at),
              updatedAt: new Date(workflowRun.updated_at),
              workflowId: workflowRun.workflow_id,
            })
            .onConflictDoUpdate({
              target: workflowRunTbl.id,
              set: {
                dollar: Math.round(dollar * 10) / 10, // round to 1 decimal place
                updatedAt: new Date(),
              },
            });
        });
    });

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data.rate, null, 2));
};
