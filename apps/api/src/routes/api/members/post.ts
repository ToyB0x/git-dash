import { getFirebaseToken } from "@hono/firebase-auth";
import { usersToWorkspaces } from "@repo/db-api/schema";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const workspaceId = c.req.param("workspaceId");
  const userId = c.req.param("userId");

  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

  await db.insert(usersToWorkspaces).values({
    userId,
    workspaceId,
    role: "OWNER",
  });

  return c.json({ success: true });
});

export const postHandler = handlers;
