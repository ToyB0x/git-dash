import { reportTbl } from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import { getR2Path } from "../../../constants";
import { HttpStatusCode } from "../../../types";
import { getDbUserFromToken, getIsBelongingWorkspace } from "../lib";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const idToken = getFirebaseToken(c);
  if (!idToken)
    return c.json(
      {
        message: "id token not found",
      },
      HttpStatusCode.UNAUTHORIZED_401,
    );

  const db = drizzle(c.env.DB_API);
  const workspaceId = c.req.param("workspaceId");

  const user = await getDbUserFromToken(idToken.uid, db);
  if (!user)
    return c.json(
      { message: "User not found in db" },
      HttpStatusCode.UNAUTHORIZED_401,
    );

  const isBelongingWorkspace = await getIsBelongingWorkspace({
    userId: user.id,
    workspaceId,
    db,
  });

  if (!isBelongingWorkspace)
    return c.json(
      { message: "User not in workspace" },
      HttpStatusCode.FORBIDDEN_403,
    );

  const lastReport = await db
    .select({ id: reportTbl.id })
    .from(reportTbl)
    .where(eq(reportTbl.workspaceId, workspaceId))
    .orderBy(desc(reportTbl.createdAt))
    .get();

  if (!lastReport)
    return c.json(
      { message: "Last report not found" },
      HttpStatusCode.NOT_FOUND_404,
    );

  const obj = await c.env.BUCKET_DB_REPORT.get(getR2Path({ workspaceId }));

  if (!obj) {
    return c.json(
      { message: "DB not found" },
      HttpStatusCode.INTERNAL_SERVER_ERROR_500,
    );
  }

  // NOTE: ブラウザのキャッシュを5分間有効にすることによりファイル転送を防止しつつ、5分以上経過した場合には最新のデータを取得する
  c.header("Cache-Control", "private, max-age=300");
  c.header("Content-Type", "application/vnd.sqlite3");
  c.header("Content-Encoding", "gzip");
  return c.body(obj.body, 200);
});

export const getHandler = handlers;
