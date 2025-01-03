import { reportTbl } from "@git-dash/db-api/schema";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import { getR2Path } from "../../../constants";

const factory = createFactory<{
  Bindings: Env;
  Variables: {
    validWorkspaceId: string;
  };
}>();

const handlers = factory.createHandlers(async (c) => {
  const db = drizzle(c.env.DB_API);

  const workspaceId = c.var.validWorkspaceId;
  const reports = await db
    .select()
    .from(reportTbl)
    .where(eq(reportTbl.workspaceId, workspaceId))
    .orderBy(desc(reportTbl.createdAt))
    .limit(1);

  const lastReport = reports[0];
  if (!lastReport) throw Error("Not Found");

  const obj = await c.env.BUCKET_DB_REPORT.get(getR2Path({ workspaceId }));

  if (!obj) throw Error("Not Found");

  // NOTE: ブラウザのキャッシュを5分間有効にすることによりファイル転送を防止しつつ、5分以上経過した場合には最新のデータを取得する
  c.header("Cache-Control", "private, max-age=300");
  c.header("Content-Type", "application/vnd.sqlite3");
  c.header("Content-Encoding", "gzip");
  return c.body(obj.body);
});

export const getHandler = handlers;
