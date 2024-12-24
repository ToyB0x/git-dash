import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const repositoryTbl = sqliteTable("repository", {
  id: text().primaryKey(), // github repository id
  name: text("name").notNull(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
});
