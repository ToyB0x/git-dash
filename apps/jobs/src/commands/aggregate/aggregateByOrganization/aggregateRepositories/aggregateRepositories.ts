import { dbClient, ghClient } from "@/clients";
import { paginate } from "./paginate";

export const aggregateRepositories = async (
  orgName: string,
  organizationId: string,
) => {
  const repositories: {
    id: string;
    name: string;
    updatedAt: string;
  }[] = [];

  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    const {
      repositories: _repositories,
      hasNextPage: _hasNextPage,
      cursor: _cursor,
    } = await paginate(ghClient, orgName, cursor);

    repositories.push(..._repositories);
    hasNextPage = _hasNextPage;
    cursor = _cursor;
  }

  // upsert repositories (because repository name can be changed)
  await Promise.all(
    repositories.map(async (repository) => {
      await dbClient.repository.upsert({
        where: {
          id: repository.id,
        },
        create: {
          id: repository.id,
          name: repository.name,
          updatedAt: repository.updatedAt,
          organizationId,
        },
        update: {
          name: repository.name,
          updatedAt: repository.updatedAt,
          organizationId,
        },
      });
    }),
  );

  return repositories;
};
