import { dbClient, hc } from "@/clients";
import { type Schema, stat } from "@repo/schema/statRepositories";

export const repositories = async (reportId: string) => {
  const repositories = await dbClient.repository.findMany({
    select: {
      name: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const repositoriesJson = {
    reportId,
    type: stat.type,
    version: stat.version,
    stats: repositories.map((repository) => ({
      name: repository.name,
      updatedAt: repository.updatedAt.getTime(),
    })),
  } satisfies Schema;

  await hc["public-api"].reports.$post({ json: repositoriesJson });
};
