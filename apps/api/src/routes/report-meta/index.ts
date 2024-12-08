import { Hono } from "hono";
import { getHandler } from "./get";
import { patchHandler } from "./patch";
import { postHandler } from "./post";

export const reportMetaRoute = new Hono()
  .get(":groupId", ...getHandler)
  .post("public/:groupId", ...postHandler)
  .patch("public", ...patchHandler);
