import type { getHonoClient } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";

export const prepare = async (
  hc: ReturnType<typeof getHonoClient>,
  configs: Configs,
) => {
  if (configs.GDASH_MODE === "PERSONAL_SAMPLE")
    throw Error("personal sample mode is not supported");

  const res = await hc["public-api"]["reports-meta"][":workspaceId"].$post({
    param: { workspaceId: configs.GDASH_WORKSPACE_ID },
  });

  if (!res.ok) {
    logger.error("Failed to create report-meta");
    process.exit(1);
  }

  const { id: reportId } = await res.json();
  return { reportId };
};
