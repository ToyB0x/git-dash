import { Hono } from "hono";
import { getHandler } from "./get";
import { postHandler } from "./post";

export const dbRoute = new Hono()
  .get("", ...getHandler)
  .post("", ...postHandler);
