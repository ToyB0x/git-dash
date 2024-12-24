import { env } from "@/env";
import { hcWithType } from "@repo/api/hc";

export const hc = hcWithType(
  env.GDASH_PROJECT_ID === "gdash-local"
    ? "http://localhost:8787"
    : `https://${env.GDASH_PROJECT_ID}.api.git-dash.com`,
  {
    headers: {
      "X-GDASH-WORKSPACE-ID": env.GDASH_WORKSPACE_ID,
      "X-GDASH-WORKSPACE-API-KEY": env.GDASH_WORKSPACE_API_KEY,
    },
  },
);
