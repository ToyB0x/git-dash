import { sleep } from "@repo/utils";
import { GraphQLClient } from "graphql-request";
import { getEnv, getSingleTenantPrismaClient } from "../../../../utils";
import { maxOld } from "../aggregateByOrganization";
import { getFirstPage } from "./getFirstPage";
import { paginate } from "./paginate";

export const aggregateRepositories = async (
  orgName: string,
  organizationId: string,
): Promise<string[]> => {
  const prismaSingleTenantClient = getSingleTenantPrismaClient();

  const githubClient = new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      Authorization: `Bearer ${getEnv().APPS_JOBS_GITHUB_PERSONAL_ACCESS_TOKEN}`,
      "X-Github-Next-Global-ID": "1",
    },
  });

  const repositories: {
    id: string;
    name: string;
    pushedAt: string | null;
    releases: {
      id: string;
      url: string;
      tagName: string;
      publishedAt: string;
    }[];
    hasVulnerabilityAlertsEnabled: boolean;
    vulnerabilityAlertsTotalCount: number;
  }[] = [];

  try {
    // get first page
    let {
      repositories: firstPageResult,
      hasNextPage,
      cursor,
    } = await getFirstPage(githubClient, orgName);

    repositories.push(...firstPageResult);

    // get paginated results
    while (hasNextPage && cursor) {
      await sleep(500);
      const {
        repositories: _repositories,
        hasNextPage: _hasNextPage,
        cursor: _cursor,
      } = await paginate(githubClient, orgName, cursor);

      repositories.push(..._repositories);
      hasNextPage = _hasNextPage;
      cursor = _cursor;
    }

    const recentRepositories = repositories.filter((repository) => {
      if (repository.pushedAt) {
        return new Date(repository.pushedAt).getTime() >= maxOld;
      }
      return false;
    });

    // upsert repositories (because repository name can be changed)
    await Promise.all(
      recentRepositories.map(async (repository) => {
        await prismaSingleTenantClient.repository.upsert({
          where: {
            id: repository.id,
          },
          create: {
            id: repository.id,
            name: repository.name,
            organizationId,
            pushedAt: repository.pushedAt
              ? new Date(repository.pushedAt)
              : null,
            hasVulnerabilityAlertsEnabled:
              repository.hasVulnerabilityAlertsEnabled,
            vulnerabilityAlertsTotalCount:
              repository.vulnerabilityAlertsTotalCount,
          },
          update: {
            name: repository.name,
            organizationId,
            pushedAt: repository.pushedAt
              ? new Date(repository.pushedAt)
              : null,
            hasVulnerabilityAlertsEnabled:
              repository.hasVulnerabilityAlertsEnabled,
            vulnerabilityAlertsTotalCount:
              repository.vulnerabilityAlertsTotalCount,
          },
        });

        await Promise.all(
          repository.releases.map(async (release) => {
            await prismaSingleTenantClient.release.upsert({
              where: {
                id: release.id,
              },
              create: {
                id: release.id,
                tagName: release.tagName,
                url: release.url,
                organizationId,
                publishedAt: new Date(release.publishedAt),
              },
              update: {
                tagName: release.tagName,
                url: release.url,
                organizationId,
                publishedAt: new Date(release.publishedAt),
              },
            });
          }),
        );
      }),
    );

    return recentRepositories.map((repository) => repository.name);
  } finally {
    await prismaSingleTenantClient.$disconnect();
  }
};
