import { Hono } from "hono";
import { reportMetaRoute, reportRoute } from "./routes";

const app = new Hono();
const routes = app
  .route("/reports", reportRoute)
  .route("/reports-meta", reportMetaRoute);

export default app;
export type AppType = typeof routes;
