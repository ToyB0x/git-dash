import type { Configs } from "@/env";
import { hcWithType } from "@repo/api/hc";

export const getHonoClient = (configs: Configs) =>
  hcWithType(
    configs.GDASH_ENV === "local"
      ? "http://localhost:8787"
      : `https://gdash-api-${configs.GDASH_ENV}.xxxxxxxxxxxxxxxxx.workers.dev`,
    {
      headers: {
        "X-GDASH-WORKSPACE-ID": configs.GDASH_WORKSPACE_ID,
        "X-GDASH-WORKSPACE-API-KEY": configs.GDASH_WORKSPACE_API_KEY,
      },
    },
  );
