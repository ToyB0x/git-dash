import { Hono } from "hono";
import { postHandler } from "./post";

export const reportsRoute = new Hono().post("", ...postHandler);
