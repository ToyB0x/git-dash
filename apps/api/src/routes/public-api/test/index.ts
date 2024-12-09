import { Hono } from "hono";
import { postHandler } from "./post";

export const testRoute = new Hono().post("", ...postHandler);
