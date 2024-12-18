import { Hono } from "hono";
import { getHandler } from "./get";

export const reportMetaRoute = new Hono().get(":workspaceId", ...getHandler);
