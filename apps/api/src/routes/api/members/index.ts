import { Hono } from "hono";
import { getHandler } from "./get";
import { postHandler } from "./post";

export const memberRoute = new Hono()
  .get(":workspaceId", ...getHandler)
  .post(":workspaceId", ...postHandler);
