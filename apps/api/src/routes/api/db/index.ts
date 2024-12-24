import { Hono } from "hono";
import { getHandler } from "./get";

export const dbRoute = new Hono().get(":workspaceId", ...getHandler);
