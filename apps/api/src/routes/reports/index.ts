import { Hono } from "hono";
import { getHandler } from "./get";
import { postHandler } from "./post";

export const reportRoute = new Hono()
  .get(":teamId/:type", ...getHandler)
  .post("public", ...postHandler);
