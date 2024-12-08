import { hcWithType } from "@repo/api/hc";

// TODO: use url from Env
export const client = hcWithType("http://localhost:8787", {
  // TODO: add header for jwt
  init: {},
});
