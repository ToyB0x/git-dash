import { Hono } from "hono";
import { postHandler } from "./post";

export const dbRoute = new Hono().post(":workspaceId", ...postHandler);
