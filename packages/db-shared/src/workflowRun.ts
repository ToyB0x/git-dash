import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { workflowTbl } from "./workflow";

export const workflowRunTbl = sqliteTable("workflow_run", {
  id: int().primaryKey(), // github workflow run id
  dollar: int().notNull(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(), // finish time?
  workflowId: int("workflow_name")
    .notNull()
    .references(() => workflowTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
});
