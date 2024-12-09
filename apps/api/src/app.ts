import { Hono } from "hono";
import { cors } from "hono/cors";
import { apiRoute } from "./routes/api";
import { healthRoute } from "./routes/health";

export const app = new Hono()
  .use(
    cors({
      origin: ["http://localhost:10000"],
    }),
  )
  .route("/health", healthRoute)
  .route("/api", apiRoute);
