import { userTbl, usersToWorkspaces } from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { and, eq } from "drizzle-orm";
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

  const workspaceMembers = await db
    .select({
      id: userTbl.id,
      email: userTbl.email,
      role: usersToWorkspaces.role,
      updatedAt: usersToWorkspaces.updatedAt,
      inviting: userTbl.firebaseUid,
    })
    .from(userTbl)
    .leftJoin(usersToWorkspaces, eq(userTbl.id, usersToWorkspaces.userId))
    .where(eq(usersToWorkspaces.workspaceId, workspaceId));

  return c.json(
    workspaceMembers.map((m) => ({
      ...m,
      inviting: !m.inviting, // convert firebaseUid to inviting status (Null means inviting, as user is not registered)
    })),
  );
});

export const getHandler = handlers;
