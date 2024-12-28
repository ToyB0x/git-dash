import { reportTbl } from "@repo/db-api/schema";
import { getR2Path } from "@repo/schema/path";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  // TODO: 認証処理の実装
  // TODO: Implement your business logic here
  // - authenticated user
  // - extract workspaceId and other params from request
  // - store r2 meta data to db

  const workspaceId = c.req.param("workspaceId");
  if (!workspaceId) throw Error("workspaceId is required");

  const db = drizzle(c.env.DB_API);
  const lastReportMeta = await db
    .select({ id: reportTbl.id })
    .from(reportTbl)
    .where(eq(reportTbl.workspaceId, workspaceId))
    .orderBy(desc(reportTbl.createdAt))
    .limit(1);

  if (lastReportMeta.length === 0 || !lastReportMeta[0]?.id) {
    return c.json(null);
  }

  // TODO: use real workspaceId / type / version
  const obj = await c.env.REPORT_BUCKET.get(
    getR2Path({
      workspaceId,
      reportId: lastReportMeta[0].id,
    }),
  );

  const j = await obj?.json();
  if (typeof j !== "object") throw Error("Failed to get data");
  return c.json(j);
});

export const getHandler = handlers;
