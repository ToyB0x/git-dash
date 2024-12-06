import { Hono } from "hono";
import { patchHandler } from "./patch";
import { postHandler } from "./post";

export const reportMetaRoute = new Hono()
  .post("", ...postHandler)
  .patch("", ...patchHandler);
