import { reportSampleTbl } from "@git-dash/db-api/schema";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import { getR2PathSample } from "../../../constants";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const db = drizzle(c.env.DB_API);
  const sampleWorkspaceId = c.req
    .param("sampleWorkspaceId")
    .replace("sample-", "");

  const lastReportSamples = await db
    .select()
    .from(reportSampleTbl)
    .where(eq(reportSampleTbl.id, sampleWorkspaceId))
    .orderBy(desc(reportSampleTbl.createdAt))
    .limit(1);

  const lastReportSample = lastReportSamples[0];

  if (!lastReportSample) throw Error("Not Found");

  // validate expire 60 minutes
  const now = new Date();
  if (now.getTime() - lastReportSample.createdAt.getTime() > 60 * 60 * 1000) {
    throw Error("Sample expired");
  }

  const obj = await c.env.BUCKET_DB_REPORT_SAMPLE.get(
    getR2PathSample({ sampleWorkspaceId }),
  );

  if (!obj) throw Error("Not Found");

  // NOTE: ブラウザのキャッシュを60分間有効にすることによりファイル転送を防止
  c.header("Cache-Control", "private, max-age=3600");
  c.header("Content-Type", "application/vnd.sqlite3");
  c.header("Content-Encoding", "gzip");
  return c.body(obj.body);
});

export const getHandler = handlers;
