import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet, nanoid } from "nanoid";

const idLength = 8;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateNewApiToken = (): string => nanoid(32);

export const groupTbl = sqliteTable("group", {
  id: text({ length: idLength }).primaryKey(),
  displayName: text({ length: 24 }).notNull(),
  // TODO: トークンをデフォルトで作らないようにする /　トークンの作成, 削除機能を作る
  apiToken: text("api_token", { length: 32 })
    .notNull()
    .$default(generateNewApiToken),
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
