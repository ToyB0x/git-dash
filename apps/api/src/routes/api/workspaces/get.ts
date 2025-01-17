import {
  userTbl,
  usersToWorkspaces,
  workspaceTbl,
} from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import { HttpStatusCode } from "../../../types";

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

  const belongingWorkspaces = await db
    .select({
      id: workspaceTbl.id,
      displayName: workspaceTbl.displayName,
      role: usersToWorkspaces.role,
      tokenHash: workspaceTbl.apiTokenHash,
    })
    .from(usersToWorkspaces)
    .leftJoin(userTbl, eq(usersToWorkspaces.userId, userTbl.id))
    .leftJoin(workspaceTbl, eq(usersToWorkspaces.workspaceId, workspaceTbl.id))
    .where(eq(userTbl.firebaseUid, idToken.uid));

  return c.json(
    belongingWorkspaces
      .filter(
        (
          workspace,
        ): workspace is {
          id: string;
          displayName: string;
          role: "OWNER" | "MANAGER" | "MEMBER";
          tokenHash: string;
        } => !!workspace.id && !!workspace.role && !!workspace.displayName,
      )
      .map((workspace) => ({
        ...workspace,
        hasKey: !!workspace.tokenHash,
      })),
  );
});

export const getHandler = handlers;
