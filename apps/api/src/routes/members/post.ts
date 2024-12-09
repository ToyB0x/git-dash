import { getFirebaseToken } from "@hono/firebase-auth";
import { vValidator } from "@hono/valibot-validator";
import { usersToGroups } from "@repo/db-api/schema";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";
import * as v from "valibot";

const factory = createFactory<{ Bindings: Env }>();

// TODO: use group schema
const validator = vValidator(
  "json",
  v.object({
    displayName: v.string(),
  }),
);

const handlers = factory.createHandlers(validator, async (c) => {
  const groupId = c.req.param("groupId");
  const userId = c.req.param("userId");

  const idToken = getFirebaseToken(c);
  if (!idToken) throw Error("Unauthorized");

  const db = drizzle(c.env.DB_API);

  await db.insert(usersToGroups).values({
    userId,
    groupId,
    role: "OWNER",
  });

  return c.json({ success: true });
});

export const postHandler = handlers;
