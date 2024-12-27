import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-valibot";
import { customAlphabet, nanoid } from "nanoid";
import * as v from "valibot";

const idLength = 8;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// NOTE: about security
// ref: https://github.com/ai/nanoid?tab=readme-ov-file#security
export const generateNewWorkspaceApiToken = (): string => nanoid(32);

export const workspaceTbl = sqliteTable("workspace", {
  id: text({ length: idLength }).primaryKey(),
  displayName: text({ length: 24 }).notNull(),
  apiTokenHash: text("api_token_hash", { length: 32 }),
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

const updateWorkspaceApiTokenSchema = createInsertSchema(workspaceTbl, {
  id: v.string(),
  apiTokenHash: v.nullable(v.string()),
});

export const patchWorkspaceApiTokenSchema = v.pick(
  updateWorkspaceApiTokenSchema,
  ["id"],
);
