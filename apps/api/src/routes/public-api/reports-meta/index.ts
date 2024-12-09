import { Hono } from "hono";
import { patchHandler } from "./patch";
import { postHandler } from "./post";

export const reportsMetaRoute = new Hono()
  .post(":groupId", ...postHandler)
  .patch(":groupId", ...patchHandler);
