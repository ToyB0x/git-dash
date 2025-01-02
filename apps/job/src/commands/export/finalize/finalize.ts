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
  if (configs.GDASH_MODE === "PERSONAL_SAMPLE")
    throw Error("personal sample mode is not supported");

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
