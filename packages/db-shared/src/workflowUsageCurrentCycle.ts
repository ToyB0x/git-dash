import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { workflowTbl } from "./workflow";

export const workflowUsageCurrentCycleTbl = sqliteTable(
  "workflow_usage_current_cycle",
  {
    id: int()
      .primaryKey()
      .references(() => workflowTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }), // github workflow id
    dollar: int().notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  },
);
