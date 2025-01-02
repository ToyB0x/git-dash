import { Hono } from "hono";
import { dbRoute } from "./db";

export const sampleApiRoute = new Hono<{ Bindings: Env }>().route(
  "/db",
  dbRoute,
);
