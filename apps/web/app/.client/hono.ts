import { hcWithType } from "@repo/api/hc";
import { publicViteEnv } from "~/env";

// TODO: use url from Env
export const client = hcWithType(publicViteEnv.VITE_PUBLIC_API_SERVER_URL, {
  // TODO: add header for jwt
  init: {},
});
