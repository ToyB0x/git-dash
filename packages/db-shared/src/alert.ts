import { int, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";
import { scanTbl } from "./scan";

export const alertTbl = sqliteTable(
  "alert",
  {
    year: int().notNull(),
    month: int().notNull(),
    day: int().notNull(),
    // NOTE: 実運用上の都合でseverityを含めたカウントを直接保存する
    // severity: text({ enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] }).notNull(), // severity of the alert
    countCritical: int("count_critical").notNull(),
    countHigh: int("count_high").notNull(),
    countMedium: int("count_medium").notNull(),
    countLow: int("count_low").notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
    repositoryId: int("repository_id")
      .notNull()
      .references(() => repositoryTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    // 同一日時に複数回診断された場合はscanIdが上書きされる
    scanId: int()
      .notNull()
      .references(() => scanTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({
      // 同一日時に複数回診断された場合はscanIdが上書きされるためscanIdを含めない
      columns: [t.repositoryId, t.year, t.month, t.day],
    }),
  }),
);
