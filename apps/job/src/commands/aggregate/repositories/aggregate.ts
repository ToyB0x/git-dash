import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";
import { repositoryTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";

export const aggregate = async () => {
  const octokit = await getOctokit();

  // TODO: 直近に更新されていないリポジトリは除外して高速化する
  // ref: https://docs.github.com/ja/rest/repos/repos?apiVersion=2022-11-28
  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: env.GDASH_GITHUB_ORGANIZATION_NAME,
    per_page: 100,
  });

  const { results, errors } = await PromisePool.for(repos)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(10)
    .process(async (repo) => {
      await sharedDbClient
        .insert(repositoryTbl)
        .values({
          id: repo.id,
          name: repo.name,
          owner: repo.owner.login,
          createdAt: repo.created_at ? new Date(repo.created_at) : new Date(),
          updatedAt: repo.updated_at ? new Date(repo.updated_at) : new Date(),
        })
        .onConflictDoUpdate({
          target: repositoryTbl.id,
          set: {
            name: repo.name,
            owner: repo.owner.login,
            updatedAt: repo.updated_at ? new Date(repo.updated_at) : new Date(),
          },
        });

      return repo;
    });

  if (errors.length) {
    logger.error(JSON.stringify(errors, null, 2));
  }

  const rateLimit = await octokit.rest.rateLimit.get();
  logger.info(JSON.stringify(rateLimit.data.rate, null, 2));

  return results;
};
