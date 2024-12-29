import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";

export const releaseTbl = sqliteTable("release", {
  id: int().primaryKey(), // github release id
  url: text("url"),
  authorId: int("author_id").notNull(),
  // NOTE: Release 収集時点ではユーザー情報は取得できていないため、Relationを外す
  // .references(() => userTbl.id, {
  //   onUpdate: "no action",
  //   onDelete: "no action",
  // }),
  title: text("name"),
  body: text("body"),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  publishedAt: int({ mode: "timestamp_ms" }),
  repositoryId: int("repository_id")
    .notNull()
    .references(() => repositoryTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
});
