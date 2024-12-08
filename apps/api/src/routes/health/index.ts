import { Hono } from "hono";
import { getHandler } from "./get";

export const healthRoute = new Hono().get("", ...getHandler);
