import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usageCurrentCycleActionOrgTbl = sqliteTable(
  "usage_current_cycle_action_org",
  {
    id: integer({ mode: "number" }).primaryKey(),
    cost: integer().notNull(),
    runnerType: text("runner_type"),
    createdAt: integer({ mode: "timestamp_ms" }).notNull(),
    updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
  },
);
