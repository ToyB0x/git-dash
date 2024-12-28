import { hc } from "@/clients";
import { env } from "@/env";
import { logger } from "@/utils";

export const prepare = async () => {
  const res = await hc["public-api"]["reports-meta"][":workspaceId"].$post({
    param: { workspaceId: env.GDASH_WORKSPACE_ID },
  });

  if (!res.ok) {
    logger.error("Failed to create report-meta");
    process.exit(1);
  }

  const { id: reportId } = await res.json();
  return { reportId };
};
