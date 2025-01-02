import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { repositoryTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

export const aggregate = async (
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  sharedDbClient: ReturnType<typeof getDbClient>,
  configs: Configs,
) => {
  // ref: https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28
  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: configs.GDASH_GITHUB_ORGANIZATION_NAME,
    per_page: 100,
  });

  const { results, errors } = await PromisePool.for(repos)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(10)
    .process(async (repo) => {
      const now = new Date();

      await sharedDbClient
        .insert(repositoryTbl)
        .values({
          id: repo.id,
          name: repo.name,
          owner: repo.owner.login,
          createdAt: now,
          createdAtGithub: repo.created_at ? new Date(repo.created_at) : null,
          updatedAt: now,
          updatedAtGithub: repo.updated_at ? new Date(repo.updated_at) : null,
        })
        .onConflictDoUpdate({
          target: repositoryTbl.id,
          set: {
            name: repo.name,
            owner: repo.owner.login,
            createdAtGithub: repo.created_at ? new Date(repo.created_at) : null,
            updatedAt: now,
            updatedAtGithub: repo.updated_at ? new Date(repo.updated_at) : null,
          },
        });

      return repo;
    });

  if (errors.length) {
    logger.error(`errors occurred: ${errors.length}`);
    for (const error of errors) {
      logger.error(JSON.stringify(error));
    }
  }

  return results;
};
