import {
  generateNewWorkspaceId,
  postWorkspaceSchema,
  userTbl,
  usersToWorkspaces,
  workspaceTbl,
} from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import { HttpStatusCode } from "../../../types";

const factory = createFactory<{ Bindings: Env }>();

const validator = vValidator("json", postWorkspaceSchema);

const handlers = factory.createHandlers(validator, async (c) => {
  const idToken = getFirebaseToken(c);
  if (!idToken)
    return c.json(
      {
        message: "id token not found",
      },
      HttpStatusCode.UNAUTHORIZED_401,
    );

  const validated = c.req.valid("json");

  const db = drizzle(c.env.DB_API);

  const matchedUser = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.firebaseUid, idToken.uid))
    .get();

  if (!matchedUser)
    return c.json(
      { message: "User not found in db" },
      HttpStatusCode.UNAUTHORIZED_401,
    );

  const generatedWorkspaceId = generateNewWorkspaceId();

  await db.batch([
    // add workspace
    db
      .insert(workspaceTbl)
      .values({
        id: generatedWorkspaceId,
        displayName: validated.displayName,
      }),

    // add self as owner
    db
      .insert(usersToWorkspaces)
      .values({
        userId: matchedUser.id,
        workspaceId: generatedWorkspaceId,
        role: "OWNER",
      }),
  ]);

  return c.json({ success: true, workspaceId: generatedWorkspaceId });
});

export const postHandler = handlers;
