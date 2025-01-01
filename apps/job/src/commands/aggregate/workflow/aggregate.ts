import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { workflowTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

export const aggregate = async (
  repositories: { id: number; name: string }[],
) => {
  const octokit = await getOctokit();

  const { errors } = await PromisePool.for(repositories)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository, i) => {
      logger.info(
        `Start aggregate:workflow:${repository.name} (${i + 1}/${repositories.length})`,
      );

      // NOTE: リポジトリ数分だけリクエストを投げるため、リポジトリ数が多い場合はQuotaに注意(500リポジトリある場合は 500 Pointsも消費してしまう)
      const workflows = await octokit.paginate(
        octokit.rest.actions.listRepoWorkflows,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 1000,
        },
      );

      const { errors } = await PromisePool.for(workflows)
        // parent: 8 , child: 10 = max 80 concurrent requests
        // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
        .withConcurrency(10)
        .process(async (workflow) => {
          await sharedDbClient
            .insert(workflowTbl)
            .values({
              id: workflow.id,
              name: workflow.name,
              path: workflow.path.replace(".github/workflows/", ""),
              createdAt: new Date(workflow.created_at),
              updatedAt: new Date(workflow.updated_at),
              repositoryId: repository.id,
            })
            .onConflictDoUpdate({
              target: workflowTbl.id,
              set: {
                name: workflow.name,
                path: workflow.path.replace(".github/workflows/", ""),
                updatedAt: new Date(workflow.updated_at),
                repositoryId: repository.id,
              },
            });
        });

      if (errors.length) {
        logger.error(`errors occurred: ${errors.length}`);
        for (const error of errors) {
          logger.error(JSON.stringify(error));
        }
      }
    });

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }
};
