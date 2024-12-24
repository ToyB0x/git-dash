import { dbClient, hc } from "@/clients";
import {
  type Schema as SchemaActionUsageCurrentCycle,
  stat as statActionUsageCurrentCycle,
} from "@repo/schema/statActionUsageCurrentCycle";

export const usage = async ({
  scanId,
  reportId,
}: {
  scanId: number;
  reportId: string;
}) => {
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
};
