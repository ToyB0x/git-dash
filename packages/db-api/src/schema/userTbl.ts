import { type SQL, sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

export const userTbl = sqliteTable(
  "user",
  {
    id: text({ length: 12 }).primaryKey(),
    email: text("email", { length: 256 }).notNull(),
    firebaseUid: text("firebase_uid", { length: 36 })
      .unique("uq_user_firebase_uid")
      .notNull(),
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
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 8);
  return nanoid(); //=> "UPsnynTq"
};
