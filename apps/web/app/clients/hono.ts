import { publicViteEnv } from "@/env";
import { hcWithType } from "@repo/api/hc";

export const hc = hcWithType(publicViteEnv.VITE_PUBLIC_API_SERVER_URL);
