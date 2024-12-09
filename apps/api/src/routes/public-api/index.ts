import { groupTbl } from "@repo/db-api/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { reportsRoute } from "./reports";
import { reportsMetaRoute } from "./reports-meta";

export const publicApiRoute = new Hono<{ Bindings: Env }>()
  .use("/*", async (c, next) => {
    const groupId = c.req.header("X-GDASH-GROUP-ID");
    const apiKey = c.req.header("X-GDASH-GROUP-API-KEY");
    if (!groupId || !apiKey)
      throw Error(
        "Invalid request headers, confirm groupId and apiKey headers are set",
      );

    const db = drizzle(c.env.DB_API);

    const groups = await db
      .select()
      .from(groupTbl)
      .where(eq(groupTbl.id, groupId));

    const group = groups[0];
    if (!group) throw Error("Group not found");

    if (group.apiToken !== apiKey) throw Error("Invalid apiKey");

    return next();
  })
  .route("/reports", reportsRoute)
  .route("/reports-meta", reportsMetaRoute);
