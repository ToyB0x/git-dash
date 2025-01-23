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
import { HttpStatusCode } from "../../../types";
import { getBelongingWorkspaceRole, getDbUserFromToken } from "../lib";

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

  const invitedUserEmail = validated.email;
  const role = validated.role;

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

  const creatorRole = await getBelongingWorkspaceRole({
    userId: user.id,
    workspaceId,
    db,
  });

  if (!creatorRole || creatorRole.role !== "OWNER") {
    return c.json(
      { message: "User not in workspace" },
      HttpStatusCode.FORBIDDEN_403,
    );
  }

  const invitedUserExist = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.email, invitedUserEmail.toLowerCase()))
    .get();

  // NOTE: 既に他ワークスペースに存在するユーザでは無い場合新規作成
  const newUserId = generateNewUserId();
  if (!invitedUserExist) {
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

  const newMemberId = invitedUserExist?.id || newUserId;

  await db.insert(usersToWorkspaces).values({
    userId: newMemberId,
    workspaceId,
    role,
  });

  return c.json({ success: true });
});

export const postHandler = handlers;
