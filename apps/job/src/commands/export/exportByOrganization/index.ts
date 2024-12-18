import { dbClient, hc } from "@/clients";
import { env } from "@/env";
import { type Schema, stat } from "@repo/schema/statRepositories";

export const exportByOrganization = async (
  orgName: string,
  groupId: string,
): Promise<void> => {
  // create report-meta
  const resPostMeta = await hc["public-api"]["reports-meta"][":groupId"].$post(
    {
      param: { groupId },
    },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": env.GDASH_GROUP_API_KEY,
      },
    },
  );

  if (!resPostMeta.ok) throw Error("Failed to create report-meta");
  const { id: reportId } = await resPostMeta.json();

  // export repositories
  const result = await dbClient.organization.findUniqueOrThrow({
    where: { login: orgName },
    select: {
      repositories: {
        select: {
          name: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  const repositoriesJson = {
    reportId,
    type: stat.type,
    version: stat.version,
    data: result.repositories.map((repository) => ({
      name: repository.name,
      updatedAt: repository.updatedAt.getTime(),
    })),
  } satisfies Schema;

  await hc["public-api"].reports.$post(
    { json: repositoriesJson },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": env.GDASH_GROUP_API_KEY,
      },
    },
  );

  // send finish status
  await hc["public-api"]["reports-meta"][":groupId"].$patch(
    {
      param: { groupId },
      json: {
        reportId,
        groupId,
        status: "FINISHED",
      },
    },
    {
      headers: {
        "X-GDASH-GROUP-ID": groupId,
        "X-GDASH-GROUP-API-KEY": env.GDASH_GROUP_API_KEY,
      },
    },
  );

  console.log("Export Done!");
};
