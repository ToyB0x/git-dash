import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { workflowTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

export const aggregate = async (
  repositories: { id: number; name: string }[],
) => {
  const octokit = await getOctokit();
  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  await PromisePool.for(repositories)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository) => {
      const workflows = await octokit.paginate(
        octokit.rest.actions.listRepoWorkflows,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 1000,
        },
      );

      await PromisePool.for(workflows)
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
    });
};
