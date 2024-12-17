import { env } from "@/env";
import { hcWithType } from "@repo/api/hc";

export const honoClient = hcWithType(
  env.GDASH_PROJECT_ID === "gdash-local"
    ? "http://localhost:8787"
    : `https://${env.GDASH_PROJECT_ID}.api.git-dash.com`,
);
