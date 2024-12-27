import { Hono } from "hono";
import { getHandler } from "./get";
import { patchHandler } from "./patch";
import { postHandler } from "./post";

export const workspaceRoute = new Hono()
  .get("", ...getHandler)
  .post("", ...postHandler)
  .patch("", ...patchHandler);
