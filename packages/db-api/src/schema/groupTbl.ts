import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

const idLength = 8;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const groupTbl = sqliteTable("group", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: false }),
  publicId: text("public_id", { length: idLength })
    .unique("uq_group_public_id")
    .notNull(),
  displayName: text({ length: 24 }).notNull(),
  createdAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: integer({ mode: "timestamp_ms" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const generateNewGroupId = (): string => {
  const nanoid = customAlphabet(idAlphabet, idLength);
  return nanoid(); //=> "UPsnynTq"
};
