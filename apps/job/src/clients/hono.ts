import type { Configs } from "@/env";
import { hcWithType } from "@repo/api/hc";

export const getHonoClient = (configs: Configs) => {
  if (configs.GDASH_MODE === "PERSONAL_SAMPLE")
    throw Error("personal sample mode is not supported");

  const { GDASH_WORKSPACE_ID, GDASH_WORKSPACE_API_KEY } = configs;

  return hcWithType(
    configs.GDASH_ENV === "local"
      ? "http://localhost:8787"
      : `https://gdash-api-${configs.GDASH_ENV}.xxxxxxxxxxxxxxxxx.workers.dev`,
    {
      headers: {
        "X-GDASH-WORKSPACE-ID": GDASH_WORKSPACE_ID,
        "X-GDASH-WORKSPACE-API-KEY": GDASH_WORKSPACE_API_KEY,
      },
    },
  );
};
