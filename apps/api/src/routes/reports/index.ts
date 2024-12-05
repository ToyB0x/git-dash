import { Hono } from "hono";
import { postHandler } from "./post";

export const reportRoute = new Hono().post("/", ...postHandler);
