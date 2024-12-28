import { getOctokit, sharedDbClient } from "@/clients";
import { env } from "@/env";
import { releaseTbl } from "@repo/db-shared";
import { PromisePool } from "@supercharge/promise-pool";
import { desc, notInArray } from "drizzle-orm";

export const aggregate = async (
  repositories: { id: number; name: string }[],
) => {
  const octokit = await getOctokit();
  await PromisePool.for(repositories)
    // parent: 8 , child: 10 = max 80 concurrent requests
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28#about-secondary-rate-limits
    .withConcurrency(8)
    .process(async (repository) => {
      // NOTE: リポジトリ数分だけリクエストを投げるため、リポジトリ数が多い場合はQuotaに注意(500リポジトリある場合は 500 Pointsも消費してしまう)
      const releases = await octokit.paginate(
        octokit.rest.repos.listReleases,
        {
          owner: env.GDASH_GITHUB_ORGANIZATION_NAME,
          repo: repository.name,
          per_page: 100,
          draft: false,
        },
        (response, done) => {
          if (
            response.data.find(
              (release) =>
                new Date(release.created_at).getTime() <
                new Date(
                  Date.now() - 1 /* month */ * 60 * 60 * 24 * 30 * 1000,
                ).getTime(),
            )
          ) {
            done();
          }
          return response.data;
        },
      );

      for (const release of releases) {
        if (release.draft || release.prerelease || !release.published_at)
          continue;

        await sharedDbClient
          .insert(releaseTbl)
          .values({
            id: release.id,
            url: release.html_url,
            authorId: release.author.id,
            title: release.name,
            publishedAt: release.published_at
              ? new Date(release.published_at)
              : null,
            body: release.body,
            createdAt: new Date(),
            updatedAt: new Date(),
            repositoryId: repository.id,
          })
          .onConflictDoUpdate({
            target: releaseTbl.id,
            set: {
              url: release.html_url,
              authorId: release.author.id,
              title: release.name,
              publishedAt: release.published_at
                ? new Date(release.published_at)
                : null,
              body: release.body,
              createdAt: new Date(),
              updatedAt: new Date(),
              repositoryId: repository.id,
            },
          });
      }
    });

  const latestReleases = await sharedDbClient
    .select()
    .from(releaseTbl)
    .orderBy(desc(releaseTbl.publishedAt))
    .limit(5);

  await sharedDbClient
    .update(releaseTbl)
    .set({
      body: null,
    })
    .where(
      notInArray(
        releaseTbl.id,
        latestReleases.map((release) => release.id),
      ),
    );
};
