import { getFirebaseToken } from "@hono/firebase-auth";
import { userTbl, usersToGroups } from "@repo/db-api/schema";
import { and, eq } from "drizzle-orm";
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

  const groupMembers = await db
    .select({ id: userTbl.id, email: userTbl.email })
    .from(userTbl)
    .leftJoin(usersToGroups, eq(userTbl.id, usersToGroups.userId))
    .where(eq(usersToGroups.groupId, groupId));

  return c.json(groupMembers);
});

export const getHandler = handlers;
