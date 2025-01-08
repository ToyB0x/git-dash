import {
  generateNewUserId,
  lower,
  userTbl,
  usersToWorkspaces,
} from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import * as v from "valibot";

const factory = createFactory<{ Bindings: Env }>();

const validator = vValidator(
  "json",
  v.object({
    email: v.string(),
    role: v.union([
      v.literal("OWNER"),
      v.literal("MANAGER"),
      v.literal("MEMBER"),
    ]),
  }),
);

const handlers = factory.createHandlers(validator, async (c) => {
  const validated = c.req.valid("json");

  const workspaceId = c.req.param("workspaceId");
  const invitedUserEmail = validated.email;
  const role = validated.role;

  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

  // check if the user is an owner of the workspace
  const creator = await db
    .select()
    .from(usersToWorkspaces)
    .where(eq(usersToWorkspaces.workspaceId, workspaceId));
  const creatorRole = creator[0]?.role;
  if (creatorRole !== "OWNER") {
    throw Error("Unauthorized");
  }

  const invidedUserExist = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.email, invitedUserEmail.toLowerCase()))
    .get();

  // NOTE: 既に他ワークスペースに存在するユーザでは無い場合新規作成
  const newUserId = generateNewUserId();
  if (!invidedUserExist) {
    await db
      .insert(userTbl)
      .values({
        id: newUserId,
        email: invitedUserEmail,
      })
      .onConflictDoNothing({
        target: [lower(userTbl.email)],
      });
  }

  const newMemberId = invidedUserExist?.id || newUserId;

  await db.insert(usersToWorkspaces).values({
    userId: newMemberId,
    workspaceId,
    role,
  });

  return c.json({ success: true });
});

export const postHandler = handlers;
