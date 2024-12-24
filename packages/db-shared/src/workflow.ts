import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";

export const workflowTbl = sqliteTable("workflow", {
  id: int().primaryKey(), // github workflow id
  name: text("name").notNull(),
  path: text("path").notNull(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  repositoryId: int()
    .notNull()
    .references(() => repositoryTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
});
