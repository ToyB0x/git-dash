import { Hono } from "hono";
import { getHandler } from "./get";
import { postHandler } from "./post";

export const reportRoute = new Hono()
  .get(":group/:type", ...getHandler)
  .post("public", ...postHandler);
