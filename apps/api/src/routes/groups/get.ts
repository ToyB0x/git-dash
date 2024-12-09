import { getFirebaseToken } from "@hono/firebase-auth";
import { groupTbl, userTbl, usersToGroups } from "@repo/db-api/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

  const belongingGroups = await db
    .select({ id: groupTbl.id, displayName: groupTbl.displayName })
    .from(usersToGroups)
    .leftJoin(userTbl, eq(usersToGroups.userId, userTbl.id))
    .leftJoin(groupTbl, eq(usersToGroups.groupId, groupTbl.id))
    .where(eq(userTbl.firebaseUid, idToken.uid));

  return c.json(
    belongingGroups.filter(
      (group): group is { id: string; displayName: string } =>
        !!group.id && !!group.displayName,
    ),
  );
});

export const getHandler = handlers;
