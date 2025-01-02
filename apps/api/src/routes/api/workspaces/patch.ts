import {
  generateNewWorkspaceApiToken,
  patchWorkspaceApiTokenSchema,
  userTbl,
  usersToWorkspaces,
  workspaceTbl,
} from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { vValidator } from "@hono/valibot-validator";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import { generateHash } from "../../../utils";

const factory = createFactory<{ Bindings: Env }>();

const validator = vValidator("json", patchWorkspaceApiTokenSchema);

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

  const workspaceRoles = await db
    .select()
    .from(usersToWorkspaces)
    .where(
      and(
        eq(usersToWorkspaces.userId, matchedUser.id),
        eq(usersToWorkspaces.workspaceId, validated.id),
      ),
    );

  const matchedWorkspaceRole = workspaceRoles[0];
  if (!matchedWorkspaceRole) throw Error("Workspace not found");

  // TODO: UIに権限機能を反映する(ボタンの非活性化など)
  if (matchedWorkspaceRole.role !== "OWNER") throw Error("Permission denied");

  const newApiToken = generateNewWorkspaceApiToken();

  await db
    .update(workspaceTbl)
    .set({
      apiTokenHash: await generateHash(newApiToken),
    })
    .where(eq(workspaceTbl.id, validated.id));

  return c.json({ newApiToken });
});

export const patchHandler = handlers;
