import { getFirebaseToken } from "@hono/firebase-auth";
import { generateNewUserId, userTbl } from "@repo/db-api/schema";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const idToken = getFirebaseToken(c); // get id-token object.
  if (!idToken) throw Error("Unauthorized");
  if (!idToken.email) throw Error("Email is missing in idToken");

  const db = drizzle(c.env.DB_API);

  const users = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.firebaseUid, idToken.uid));

  // already registered
  if (users.length > 0) return c.json({ success: true });

  // not registered yet, so create a new user
  await db.insert(userTbl).values({
    id: generateNewUserId(),
    email: idToken.email,
    firebaseUid: idToken.uid,
  });

  return c.json({ success: true });
});

export const postHandler = handlers;
