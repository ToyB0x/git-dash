import { workspaceTbl } from "@repo/db-api/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { generateHash } from "../../utils";
import { dbRoute } from "./db";
import { reportsRoute } from "./reports";
import { reportsMetaRoute } from "./reports-meta";
import { testRoute } from "./test";

export const publicApiRoute = new Hono<{
  Bindings: Env;
  Variables: {
    validWorkspaceId: string;
  };
}>()
  .use("/*", async (c, next) => {
    const workspaceId = c.req.header("X-GDASH-WORKSPACE-ID");
    const apiKey = c.req.header("X-GDASH-WORKSPACE-API-KEY");
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
    if (!workspace) throw Error("Workspace not found");

    if (workspace.apiTokenHash !== (await generateHash(apiKey)))
      throw Error("Invalid apiKey");

    c.set("validWorkspaceId", workspace.id);
    return next();
  })
  .route("/reports", reportsRoute)
  .route("/reports-meta", reportsMetaRoute)
  .route("/test", testRoute)
  .route("/db", dbRoute);
