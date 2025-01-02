import {
  userTbl,
  usersToWorkspaces,
  workspaceTbl,
} from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

  const belongingWorkspaces = await db
    .select({
      id: workspaceTbl.id,
      displayName: workspaceTbl.displayName,
      role: usersToWorkspaces.role,
    })
    .from(usersToWorkspaces)
    .leftJoin(userTbl, eq(usersToWorkspaces.userId, userTbl.id))
    .leftJoin(workspaceTbl, eq(usersToWorkspaces.workspaceId, workspaceTbl.id))
    .where(eq(userTbl.firebaseUid, idToken.uid));

  return c.json(
    belongingWorkspaces.filter(
      (
        workspace,
      ): workspace is {
        id: string;
        displayName: string;
        role: "OWNER" | "ADMIN" | "MEMBER";
      } => !!workspace.id && !!workspace.role && !!workspace.displayName,
    ),
  );
});

export const getHandler = handlers;
