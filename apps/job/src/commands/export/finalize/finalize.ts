import { hc } from "@/clients";
import { env } from "@/env";

export const finalize = async ({
  reportId,
}: {
  reportId: string;
}) => {
  // send finish status
  await hc["public-api"]["reports-meta"][":workspaceId"].$patch({
    param: { workspaceId: env.GDASH_WORKSPACE_ID },
    json: {
      reportId,
      workspaceId: env.GDASH_WORKSPACE_ID,
      status: "FINISHED",
    },
  });
};
