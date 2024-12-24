import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTbl = sqliteTable("user", {
  id: int().primaryKey(), // github user id
  login: text("title").notNull(),
  avatarUrl: int("avatar_url").notNull(),
});
