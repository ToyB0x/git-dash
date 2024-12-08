import { Hono } from "hono";
import { getHandler } from "./get";
import { postHandler } from "./post";

export const reportRoute = new Hono()
  .get(":type", ...getHandler)
  .post("public", ...postHandler);
