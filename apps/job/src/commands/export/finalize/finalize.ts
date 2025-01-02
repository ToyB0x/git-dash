import type { getHonoClient } from "@/clients";
import type { Configs } from "@/env";

export const finalize = async ({
  hc,
  reportId,
  configs,
}: {
  hc: ReturnType<typeof getHonoClient>;
  reportId: string;
  configs: Configs;
}) => {
  // send finish status
  await hc["public-api"]["reports-meta"][":workspaceId"].$patch({
    param: { workspaceId: configs.GDASH_WORKSPACE_ID },
    json: {
      reportId,
      workspaceId: configs.GDASH_WORKSPACE_ID,
      status: "FINISHED",
    },
  });
};
