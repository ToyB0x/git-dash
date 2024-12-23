import { dbClient, hc } from "@/clients";
import {
  type Schema as SchemaCost,
  stat as statCost,
} from "@repo/schema/statCost";

export const cost = async ({
  scanId,
  reportId,
}: {
  scanId: number;
  reportId: string;
}) => {
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
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString(),
      cost: Math.round(cost * 10) / 10, // 0.1 $ precision
    },
  } satisfies SchemaCost;

  await hc["public-api"].reports.$post({ json: costJson });
};
