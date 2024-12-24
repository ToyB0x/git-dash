import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";

export const prTbl = sqliteTable("pr", {
  id: int().primaryKey(), // github pr id
  title: text("title").notNull(),
  number: int("number").notNull(), // github pr number (eg: #123)
  state: text("state").notNull(),
  additions: int("additions").notNull(),
  deletions: int("deletions").notNull(),
  changedFiles: int("changed_files").notNull(),
  merged_at: int({ mode: "timestamp_ms" }),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  authorId: int("author_id").notNull(),
  repositoryId: int("repository_id")
    .notNull()
    .references(() => repositoryTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
});
