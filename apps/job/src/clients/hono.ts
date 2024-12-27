import { env } from "@/env";
import { hcWithType } from "@repo/api/hc";

export const hc = hcWithType(
  env.GDASH_ENV === "local"
    ? "http://localhost:8787"
    : `https://gdash-api-${env.GDASH_ENV}.xxxxxxxxxxxxxxxxx.workers.dev`,
  {
    headers: {
      "X-GDASH-WORKSPACE-ID": env.GDASH_WORKSPACE_ID,
      "X-GDASH-WORKSPACE-API-KEY": env.GDASH_WORKSPACE_API_KEY,
    },
  },
);
