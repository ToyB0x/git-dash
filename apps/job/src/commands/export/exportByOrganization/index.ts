import { dbClient, hc } from "@/clients";
import { env } from "@/env";
import {
  type Schema as SchemaCost,
  stat as statCost,
} from "@repo/schema/statCost";
import { type Schema, stat } from "@repo/schema/statRepositories";

export const exportByOrganization = async (
  orgName: string,
  workspaceId: string,
): Promise<void> => {
  const { id: scanId } = await dbClient.scan.findFirstOrThrow({
    orderBy: {
      createdAt: "desc",
    },
  });
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
    stats: result.repositories.map((repository) => ({
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

  // export cost
  const usages = await dbClient.workflowUsageRepoDaily.findMany({
    where: { scanId },
  });

  const cost = usages.reduce((acc, usage) => {
    // https://docs.github.com/ja/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions#per-minute-rates-for-standard-runners
    switch (usage.runner) {
      case "UBUNTU":
        return acc + Math.ceil(usage.totalMs / (1000 * 60)) * 0.008;
      case "UBUNTU_4_CORE":
        return acc + Math.ceil(usage.totalMs / (1000 * 60)) * 0.016;
      case "UBUNTU_16_CORE":
        return acc + Math.ceil(usage.totalMs / (1000 * 60)) * 0.064;
      case "MACOS":
        return acc + Math.ceil(usage.totalMs / (1000 * 60)) * 0.08;
      default:
        throw Error("Please Add Runner Type");
    }
  }, 0);

  const costJson = {
    reportId,
    type: statCost.type,
    version: statCost.version,
    stats: {
      date: new Date().toDateString(),
      cost: Math.round(cost * 10) / 10, // 0.1 $ precision
    },
  } satisfies SchemaCost;

  await hc["public-api"].reports.$post(
    { json: costJson },
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
