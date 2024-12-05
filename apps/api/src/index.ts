import { Hono } from "hono";
import { reportRoute } from "./routes";

const app = new Hono();
const routes = app.route("/reports", reportRoute);

export default app;
export type AppType = typeof routes;
