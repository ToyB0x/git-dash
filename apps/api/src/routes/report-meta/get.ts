import { reportTbl } from "@repo/db-api/schema";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  // TODO: Implement your business logic here
  // - authenticated user
  // - extract groupId and other params from request
  // - store r2 meta data to db

  const db = drizzle(c.env.DB_API);
  const lastReportMeta = await db
    .select({ id: reportTbl.id })
    .from(reportTbl)
    .orderBy(desc(reportTbl.createdAt))
    .where(eq(reportTbl.groupId, Number(c.req.param("groupId"))))
    .limit(1);

  if (lastReportMeta.length === 0) {
    return c.json(null);
  }

  return c.json(lastReportMeta[0]);
});

export const getHandler = handlers;
