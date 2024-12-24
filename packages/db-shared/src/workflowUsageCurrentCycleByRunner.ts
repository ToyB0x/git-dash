import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workflowUsageCurrentCycleByRunnerTbl = sqliteTable(
  "workflow_usage_current_cycle_by_runner",
  {
    runnerType: text("runner_type").primaryKey(),
    dollar: int().notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  },
);
