import { Hono } from "hono";
import { getHandler } from "./get";
import { postHandler } from "./post";

export const memberRoute = new Hono()
  .get(":groupId", ...getHandler)
  .post(":groupId/;userId", ...postHandler);
