import { Hono } from "hono";
import { getHandler } from "./get";
import { postHandler } from "./post";

export const reportRoute = new Hono()
  .get(":tgroupId/:type", ...getHandler)
  .post("public", ...postHandler);
