import { Hono } from "hono";
import { cors } from "hono/cors";
import { apiRoute } from "./routes/api";
import { healthRoute } from "./routes/health";
import { publicApiRoute } from "./routes/public-api";

export const app = new Hono()
  .use(
    cors({
      origin: (origin) => {
        return origin.endsWith(".git-dash.com")
          ? origin
          : "http://localhost:10000";
      },
    }),
  )
  .route("/health", healthRoute)
  .route("/api", apiRoute)
  .route("/public-api", publicApiRoute);
