import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import { customAlphabet, nanoid } from "nanoid";
import * as v from "valibot";

const idLength = 8;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const generateNewApiToken = (): string => nanoid(32);

export const workspaceTbl = sqliteTable("workspace", {
  id: text({ length: idLength }).primaryKey(),
  displayName: text({ length: 24 }).notNull(),
  // TODO: トークンをデフォルトで作らないようにする /　トークンの作成, 削除機能を作る
  // NOTE: about security
  // ref: https://github.com/ai/nanoid?tab=readme-ov-file#security
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

export const generateNewWorkspaceId = (): string => {
  const nanoid = customAlphabet(idAlphabet, idLength);
  return nanoid(); //=> "UPsnynTq"
};

const createWorkspaceSchema = createInsertSchema(workspaceTbl, {
  displayName: v.string(),
});

export const postWorkspaceSchema = v.pick(createWorkspaceSchema, [
  "displayName",
]);
