import { int, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { workflowTbl } from "./workflow";

export const workflowUsageCurrentCycleTbl = sqliteTable(
  "workflow_usage_current_cycle",
  {
    year: int().notNull(),
    month: int().notNull(),
    day: int().notNull(),
    workflowId: int("workflow_id")
      .notNull()
      .references(() => workflowTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }), // github workflow id
    dollar: int().notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.year, t.month, t.day, t.workflowId] }),
  }),
);
