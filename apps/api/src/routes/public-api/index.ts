import { workspaceTbl } from "@repo/db-api/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { reportsRoute } from "./reports";
import { reportsMetaRoute } from "./reports-meta";
import { testRoute } from "./test";

export const publicApiRoute = new Hono<{
  Bindings: Env;
  Variables: {
    validGorkspaceId: string;
  };
}>()
  .use("/*", async (c, next) => {
    const workspaceId = c.req.header("X-GDASH-GROUP-ID");
    const apiKey = c.req.header("X-GDASH-GROUP-API-KEY");
    if (!workspaceId || !apiKey)
      throw Error(
        "Invalid request headers, confirm workspaceId and apiKey headers are set",
      );

    const db = drizzle(c.env.DB_API);

    const workspaces = await db
      .select()
      .from(workspaceTbl)
      .where(eq(workspaceTbl.id, workspaceId));

    const workspace = workspaces[0];
    if (!workspace) throw Error("Gorkspace not found");

    if (workspace.apiToken !== apiKey) throw Error("Invalid apiKey");

    c.set("validGorkspaceId", workspace.id);
    return next();
  })
  .route("/reports", reportsRoute)
  .route("/reports-meta", reportsMetaRoute)
  .route("/test", testRoute);
