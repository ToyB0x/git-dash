import { int, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";
import { scanTbl } from "./scan";
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
    // 同一日時に複数回診断された場合はscanIdが上書きされる
    scanId: int()
      .notNull()
      .references(() => scanTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    repositoryId: int("repository_id") // PRテーブルを経由してリポジトリ情報を取得するのが実務上不便なのでリレーションを追加
      .notNull()
      .references(() => repositoryTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.year, t.month, t.day, t.workflowId] }),
  }),
);
