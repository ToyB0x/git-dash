import { Hono } from "hono";
import { cors } from "hono/cors";
import { reportMetaRoute, reportRoute } from "./routes";

export const app = new Hono()
  .use(
    "/*",
    cors({
      origin: ["http://localhost:10000"],
    }),
  )
  .route("/reports", reportRoute)
  .route("/reports-meta", reportMetaRoute);
