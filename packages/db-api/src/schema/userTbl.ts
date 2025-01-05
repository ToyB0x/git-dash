import { type SQL, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

const idLength = 8;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const userTbl = sqliteTable(
  "user",
  {
    id: text({ length: idLength }).primaryKey(),
    email: text("email", { length: 256 }).notNull(),
    firebaseUid: text("firebase_uid", { length: 36 })
      .unique("uq_user_firebase_uid"),
      // .notNull(), // null means the user is not signed up yet, but invited by another user (Currently, cloudflare workers doesn't support firebase admin sdk, so we can't create a user from the backend)
    createdAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (tbl) => ({
    uniqueLowerEmail: uniqueIndex("uq_user_lower_email").on(lower(tbl.email)),
  }),
);

// custom lower function
export function lower(column: AnySQLiteColumn): SQL {
  return sql`lower(${column})`;
}

export const generateNewUserId = (): string => {
  const nanoid = customAlphabet(idAlphabet, idLength);
  return nanoid(); //=> "UPsnynTq"
};