import { dbClient, hc } from "@/clients";
import { env } from "@/env";
import { type Schema, stat } from "@repo/schema/statRepositories";

export const exportByOrganization = async (
  orgName: string,
  workspaceId: string,
): Promise<void> => {
  // create report-meta
  const resPostMeta = await hc["public-api"]["reports-meta"][
    ":workspaceId"
  ].$post(
    {
      param: { workspaceId },
    },
    {
      headers: {
        "X-GDASH-WORKSPACE-ID": workspaceId,
        "X-GDASH-WORKSPACE-API-KEY": env.GDASH_WORKSPACE_API_KEY,
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
        "X-GDASH-WORKSPACE-ID": workspaceId,
        "X-GDASH-WORKSPACE-API-KEY": env.GDASH_WORKSPACE_API_KEY,
      },
    },
  );

  // send finish status
  await hc["public-api"]["reports-meta"][":workspaceId"].$patch(
    {
      param: { workspaceId },
      json: {
        reportId,
        workspaceId,
        status: "FINISHED",
      },
    },
    {
      headers: {
        "X-GDASH-WORKSPACE-ID": workspaceId,
        "X-GDASH-WORKSPACE-API-KEY": env.GDASH_WORKSPACE_API_KEY,
      },
    },
  );

  console.log("Export Done!");
};
