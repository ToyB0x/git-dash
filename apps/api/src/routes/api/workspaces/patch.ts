import { getFirebaseToken } from "@hono/firebase-auth";
import { vValidator } from "@hono/valibot-validator";
import {
  generateNewWorkspaceApiToken,
  patchWorkspaceApiTokenSchema,
  userTbl,
  usersToWorkspaces,
  workspaceTbl,
} from "@repo/db-api/schema";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

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

  // ref: https://stackoverflow.com/a/64795218
  // for security improvement, do not store the api token as plain text, hash it
  const hashBuffer = await crypto.subtle.digest(
    {
      name: "SHA-256",
    },
    new TextEncoder().encode(newApiToken), // The data you want to hash as an ArrayBuffer
  );

  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string

  await db
    .update(workspaceTbl)
    .set({
      apiTokenHash: hashHex,
    })
    .where(eq(workspaceTbl.id, validated.id));

  return c.json({ newApiToken });
});

export const patchHandler = handlers;
