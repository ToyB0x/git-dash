import { Hono } from "hono";
import { getHandler } from "./get";

export const reportRoute = new Hono().get(":groupId/:type", ...getHandler);
