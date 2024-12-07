import { reportTbl } from "@repo/db-api/schema";
import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  // TODO: Implement your business logic here
  // - authenticated user
  // - extract teamId and other params from request
  // - store r2 meta data to db

  const db = drizzle(c.env.DB_API);
  const lastReportMeta = await db
    .select({ id: reportTbl.id })
    .from(reportTbl)
    .orderBy(desc(reportTbl.createdAt))
    .limit(1);

  if (lastReportMeta.length === 0) {
    return c.json(null);
  }

  // TODO: use real teamId / type / version
  const obj = await c.env.REPORT_BUCKET.get(
    `teams/2edd4c47-b01c-49eb-9711-5e8106bbabcf/reports/${lastReportMeta[0].id}/types/statMerged/versions/1.0/data.json`,
  );

  const j = await obj?.json();
  if (typeof j !== "object") throw Error("Failed to get data");
  return c.json(j);
});

export const getHandler = handlers;
