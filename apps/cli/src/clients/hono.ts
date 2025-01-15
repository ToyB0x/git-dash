import { type Configs, GDASH_MODES } from "@/env";
import { hcWithType } from "@git-dash/api/hc";

export const getHonoClient = (configs: Configs) => {
  const apiUrl =
    configs.GDASH_ENV === "local"
      ? "http://localhost:8787"
      : `https://gdash-api-${configs.GDASH_ENV}.xxxxxxxxxxxxxxxxx.workers.dev`;

  const { GDASH_WORKSPACE_ID, GDASH_WORKSPACE_API_KEY } = configs;

  return hcWithType(apiUrl, {
    headers: {
      "X-GDASH-WORKSPACE-ID": GDASH_WORKSPACE_ID,
      "X-GDASH-WORKSPACE-API-KEY": GDASH_WORKSPACE_API_KEY,
    },
  });
};
