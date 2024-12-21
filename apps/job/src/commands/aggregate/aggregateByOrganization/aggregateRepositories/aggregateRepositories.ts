import { dbClient, getGhClient } from "@/clients";
import { paginate } from "./paginate";

export const aggregateRepositories = async (
  orgName: string,
  organizationId: string,
) => {
  const repositories: {
    id: string;
    name: string;
    // TODO: pushedAtの方が適切かもしれないので要確認(リポジトリ設定の更新などしか検知できていないかも？)
    updatedAt: string;
  }[] = [];

  let hasNextPage = true;
  let cursor = null;

  const ghClient = await getGhClient();
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

  console.info(
    "Aggregate Repositories complete 🎉",
    repositories.map((repository) => repository.name),
  );
  return repositories;
};
