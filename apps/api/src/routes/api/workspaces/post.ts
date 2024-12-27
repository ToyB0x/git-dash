import { getFirebaseToken } from "@hono/firebase-auth";
import { vValidator } from "@hono/valibot-validator";
import {
  generateNewWorkspaceId,
  postWorkspaceSchema,
  userTbl,
  usersToWorkspaces,
  workspaceTbl,
} from "@repo/db-api/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const validator = vValidator("json", postWorkspaceSchema);

const handlers = factory.createHandlers(validator, async (c) => {
  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const validated = c.req.valid("json");

  const db = drizzle(c.env.DB_API);

  const users = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.firebaseUid, idToken.uid));

  const matchedUser = users[0];
  if (!matchedUser) throw Error("User not found");

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
