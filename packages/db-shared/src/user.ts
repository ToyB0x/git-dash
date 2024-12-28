import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTbl = sqliteTable("user", {
  id: int().primaryKey(), // github user id
  login: text("login").notNull(),
  name: text("name"),
  blog: text("blog"),
  avatarUrl: text("avatar_url").notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  // TODO: continue 機能実装時に以下を実装
  // lastScannedAt: int({ mode: "timestamp_ms" }).notNull(),
});
