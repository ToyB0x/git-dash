import { userTbl, usersToWorkspaces } from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
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
  if (!workspaceId)
    return c.json(
      { message: "Workspace id not found" },
      HttpStatusCode.BAD_REQUEST_400,
    );

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
