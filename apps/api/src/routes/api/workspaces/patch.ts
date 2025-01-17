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
import { HttpStatusCode } from "../../../types";
import { generateHash } from "../../../utils";

const factory = createFactory<{ Bindings: Env }>();

const validator = vValidator("json", patchWorkspaceApiTokenSchema);

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
  if (!matchedWorkspaceRole)
    return c.json(
      { message: "Workspace not found" },
      HttpStatusCode.NOT_FOUND_404,
    );

  // TODO: UIに権限機能を反映する(ボタンの非活性化など)
  if (matchedWorkspaceRole.role !== "OWNER")
    return c.json(
      {
        message: "You are not the owner of this workspace",
      },
      HttpStatusCode.FORBIDDEN_403,
    );

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
