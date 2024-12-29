import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workflowUsageCurrentCycleOrgTbl = sqliteTable(
  "workflow_usage_current_cycle_org",
  {
    year: int().notNull(),
    month: int().notNull(),
    day: int().notNull(),
    dollar: int().notNull(),
    // TODO: DB容量を削減したい場合はrunnerTypeを別のマスタテーブルに切り出すことを検討
    runnerType: text("runner_type").notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.year, t.month, t.day] }),
  }),
);
