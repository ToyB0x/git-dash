import { publicViteEnv } from "@/env";
import { hcWithType } from "@git-dash/api/hc";

export const hc = hcWithType(publicViteEnv.VITE_PUBLIC_API_SERVER_URL);
