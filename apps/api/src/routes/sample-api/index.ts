import { Hono } from "hono";
import { dbRoute } from "./db";

export const apiRoute = new Hono<{ Bindings: Env }>().route("/db", dbRoute);
