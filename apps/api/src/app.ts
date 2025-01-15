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

// NOTE: currently, Hono does not support custom error handling typing with RPC (so we cannot use HTTPException)
// ref: https://github.com/honojs/hono/issues/2719
// ref: https://hono.dev/docs/api/exception#handling-httpexception
// app.onError((err, c) => {
//   if (err instanceof HTTPException) {
//     // Get the custom response
//     return err.getResponse();
//   }
// });
