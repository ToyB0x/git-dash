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
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: false }),
    publicId: text("public_id", { length: idLength }).unique(
      "uq_user_public_id",
    ),
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
  const nanoid = customAlphabet(idAlphabet, idLength);
  return nanoid(); //=> "UPsnynTq"
};
