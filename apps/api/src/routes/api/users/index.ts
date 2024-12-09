import { Hono } from "hono";
import { postHandler } from "./post";

export const userRoute = new Hono().post("", ...postHandler);
