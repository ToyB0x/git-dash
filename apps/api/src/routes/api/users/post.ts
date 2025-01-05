import { generateNewUserId, userTbl } from "@git-dash/db-api/schema";
import { getFirebaseToken } from "@hono/firebase-auth";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { createFactory } from "hono/factory";

const factory = createFactory<{ Bindings: Env }>();

const handlers = factory.createHandlers(async (c) => {
  const idToken = getFirebaseToken(c); // get id-token object.
  if (!idToken) throw Error("Unauthorized");
  if (!idToken.email) throw Error("Email is missing in idToken");

  const db = drizzle(c.env.DB_API);

  const existUsers = await db
    .select()
    .from(userTbl)
    .where(eq(userTbl.email, idToken.email));

  const existUser = existUsers[0];

  if (existUser) {
    // already registered
    if (existUser.firebaseUid === idToken.uid) {
      return c.json({ success: true });
    }
    // user invited, but not registered yet
    await db.update(userTbl).set({ firebaseUid: idToken.uid }).where(eq(userTbl.email, idToken.email));
    return c.json({ success: true });
  }

  // not registered yet, so create a new user
  await db.insert(userTbl).values({
    id: generateNewUserId(),
    email: idToken.email,
    firebaseUid: idToken.uid,
  });

  return c.json({ success: true });
});

export const postHandler = handlers;