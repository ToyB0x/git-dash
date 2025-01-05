import {generateNewUserId, lower, userTbl, usersToWorkspaces } from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import {vValidator} from "@hono/valibot-validator";
import {eq} from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import * as v from "valibot";

const factory = createFactory<{ Bindings: Env }>();

const validator = vValidator("json", v.object({
  email: v.string(),
  role: v.union([v.literal("OWNER"), v.literal("MANAGER"), v.literal("MEMBER")]),
}));


const handlers = factory.createHandlers(validator,
  async (c) => {

  const validated = c.req.valid("json");

  const workspaceId = c.req.param("workspaceId");
  const email = validated.email;
  const role = validated.role;

  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

    // check if the user is an owner of the workspace
    const creator = await db.select().from(usersToWorkspaces).where(eq(usersToWorkspaces.workspaceId, workspaceId));
    const creatorRole = creator[0]?.role;
    if (creatorRole !== "OWNER") {
      throw Error("Unauthorized");
    }

    // TODO: crete a new user if it doesn't exist
      const newMemberUsers = await db.insert(userTbl).values({
        id: generateNewUserId(),
        email,
      }).onConflictDoNothing({
        target: [lower(userTbl.email)],
      }).returning();

    const newMemberUser = newMemberUsers[0];
    if (!newMemberUser) {
      throw Error("Failed to create a user");
    }

  await db.insert(usersToWorkspaces).values({
    userId: newMemberUser.id,
    workspaceId,
    role,
  });

  return c.json({ success: true });
});

export const postHandler = handlers;