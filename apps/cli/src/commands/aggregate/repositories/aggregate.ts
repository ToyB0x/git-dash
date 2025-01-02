import type { getDbClient, getOctokit } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { repositoryTbl } from "@git-dash/db";
import { PromisePool } from "@supercharge/promise-pool";
import { subDays } from "date-fns";

export const aggregate = async (
  octokit: Awaited<ReturnType<typeof getOctokit>>,
  sharedDbClient: ReturnType<typeof getDbClient>,
  configs: Configs,
  maxOldRepoDate?: Date,
) => {
  // ref: https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28
  const repos = await octokit.paginate(
    octokit.rest.repos.listForOrg,
    {
      org: configs.GDASH_GITHUB_ORGANIZATION_NAME,
      per_page: 100,
      sort: "pushed",
      direction: "desc",
    },
    (response, done) => {
      const maxOld =
        maxOldRepoDate ||
        subDays(new Date(), configs.GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS);
      if (
        response.data.find(
          (repo) => !repo.pushed_at || new Date(repo.pushed_at) < maxOld,
        )
      ) {
        done();
      }
      return response.data;
    },
  );

  const recentRepos = repos.filter((repo) => {
    const maxOld =
      maxOldRepoDate ||
      subDays(new Date(), configs.GDASH_COLLECT_DAYS_HEAVY_TYPE_ITEMS);
    return repo.pushed_at && new Date(repo.pushed_at) >= maxOld;
  });

  const { results, errors } = await PromisePool.for(recentRepos)
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