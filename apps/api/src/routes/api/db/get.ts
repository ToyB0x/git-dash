import { getFirebaseToken } from "@hono/firebase-auth";
import { reportTbl } from "@repo/db-api/schema";
import { getR2Path } from "@repo/schema/path";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);
  const workspaceId = c.req.param("workspaceId");

  const lastReportMeta = await db
    .select({ id: reportTbl.id })
    .from(reportTbl)
    .where(eq(reportTbl.workspaceId, workspaceId))
    .orderBy(desc(reportTbl.createdAt))
    .limit(1);

  if (lastReportMeta.length === 0 || !lastReportMeta[0]?.id) {
    throw Error("Not Found");
  }

  const obj = await c.env.REPORT_BUCKET.get(
    getR2Path({
      workspaceId,
      reportId: lastReportMeta[0].id,
    }),
  );

  if (!obj) throw Error("Not Found");

  // NOTE: ブラウザのキャッシュを5分間有効にすることによりファイル転送を防止しつつ、5分以上経過した場合には最新のデータを取得する
  c.header("Cache-Control", "private, max-age=300");
  c.header("Content-Type", "application/vnd.sqlite3");
  c.header("Content-Encoding", "gzip");
  return c.body(obj.body);
});

export const getHandler = handlers;
