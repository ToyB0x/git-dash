import { dbClient, hc } from "@/clients";
import { step } from "@/utils";
import {
  type Schema as SchemaActionUsageCurrentCycle,
  stat as statActionUsageCurrentCycle,
} from "@repo/schema/statActionUsageCurrentCycle";
import { cost } from "./cost";
import { prepare } from "./prepare";
import { repositories } from "./repositories";

export const exportByOrganization = async (
  workspaceId: string,
): Promise<void> => {
  const { scanId, reportId } = await step({
    stepName: "export:prepare",
    callback: prepare(),
  });

  await step({
    stepName: "export:repositories",
    callback: repositories(reportId),
  });

  await step({
    stepName: "export:cost",
    callback: cost({ scanId, reportId }),
  });

  // export cost
  const actionUsageCurrentCycle =
    await dbClient.actionUsageCurrentCycle.findMany({
      where: { scanId },
    });

  const actionUsageCurrentCycleJson = {
    reportId,
    type: statActionUsageCurrentCycle.type,
    version: statActionUsageCurrentCycle.version,
    stats: actionUsageCurrentCycle.map((actionUsage) => ({
      runnerType: actionUsage.runnerType,
      cost: actionUsage.cost,
    })),
  } satisfies SchemaActionUsageCurrentCycle;

  await hc["public-api"].reports.$post({ json: actionUsageCurrentCycleJson });

  // send finish status
  await hc["public-api"]["reports-meta"][":workspaceId"].$patch({
    param: { workspaceId },
    json: {
      reportId,
      workspaceId,
      status: "FINISHED",
    },
  });

  console.log("Export Done!");
};
