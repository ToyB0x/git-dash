import { getFirebaseToken } from "@hono/firebase-auth";
import { reportTbl, userTbl, usersToGroups } from "@repo/db-api/schema";
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const groupId = c.req.param("groupId");

  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

  const users = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.firebaseUid, idToken.uid));

  const user = users[0];
  if (!user) throw Error("User not found");

  const isBelongingGroup = await db
    .select()
    .from(usersToGroups)
    .where(
      and(
        eq(usersToGroups.userId, user.id),
        eq(usersToGroups.groupId, groupId),
      ),
    );

  if (!isBelongingGroup.length) throw Error("User not in group");

  const lastReportMeta = await db
    .select({ id: reportTbl.id })
    .from(reportTbl)
    .orderBy(desc(reportTbl.createdAt))
    .where(eq(reportTbl.groupId, groupId))
    .limit(1);

  if (lastReportMeta.length === 0) {
    return c.json(null);
  }

  return c.json(lastReportMeta[0]);
});

export const getHandler = handlers;
