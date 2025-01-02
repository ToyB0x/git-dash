import { reportTbl, userTbl, usersToWorkspaces } from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const workspaceId = c.req.param("workspaceId");

  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

  const users = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.firebaseUid, idToken.uid));

  const user = users[0];
  if (!user) throw Error("User not found");

  const isBelongingWorkspace = await db
    .select()
    .from(usersToWorkspaces)
    .where(
      and(
        eq(usersToWorkspaces.userId, user.id),
        eq(usersToWorkspaces.workspaceId, workspaceId),
      ),
    );

  if (!isBelongingWorkspace.length) throw Error("User not in workspace");

  const lastReportMeta = await db
    .select({ id: reportTbl.id })
    .from(reportTbl)
    .orderBy(desc(reportTbl.createdAt))
    .where(eq(reportTbl.workspaceId, workspaceId))
    .limit(1);

  if (lastReportMeta.length === 0) {
    return c.json(null);
  }

  return c.json(lastReportMeta[0]);
});

export const getHandler = handlers;
