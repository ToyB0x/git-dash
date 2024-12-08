import { Hono } from "hono";
import { getHandler } from "./get";
import { patchHandler } from "./patch";
import { postHandler } from "./post";

export const reportMetaRoute = new Hono()
  .get(":teamId", ...getHandler)
  .post("public/:teamId", ...postHandler)
  .patch("public", ...patchHandler);
