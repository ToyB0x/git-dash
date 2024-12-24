import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usageCurrentCycleActionOrgTbl = sqliteTable(
  "usage_current_cycle_action_org",
  {
    id: int().primaryKey(),
    cost: int().notNull(),
    runnerType: text("runner_type").notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  },
);
