import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workflowUsageCurrentCycleOrgTbl = sqliteTable(
  "workflow_usage_current_cycle_org",
  {
    year: int().notNull(),
    month: int().notNull(),
    day: int().notNull(),
    dollar: int().notNull(),
    // TODO: DB容量を削減したい場合はrunnerTypeを別のマスタテーブルに切り出すことを検討
    // (eg: 14 bytes(ubuntu_16_core text size) * 360 days * 10 runnerType = 50.4kb)
    runnerType: text("runner_type").notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
    // 実運用上scanIdではなく、updatedAtでの集計を行うためリレーションは持たない
    // scanId: int()
    //   .notNull()
    //   .references(() => scanTbl.id, {
    //     onUpdate: "cascade",
    //     onDelete: "cascade",
    //   }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.year, t.month, t.day, t.runnerType] }),
  }),
);
