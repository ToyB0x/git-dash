import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const repositoryTbl = sqliteTable("repository", {
  id: int().primaryKey(), // github repository id
  name: text("name").notNull(), // repo name (ex. drizzle-core section of "@drizzle-org/drizzle-core")
  owner: text("owner").notNull(), // owner login name
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
});
