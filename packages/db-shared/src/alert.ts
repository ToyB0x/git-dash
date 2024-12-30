import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { repositoryTbl } from "./repository";

export const alertTbl = sqliteTable(
  "alert",
  {
    count: int().notNull(),
    year: int().notNull(),
    month: int().notNull(),
    day: int().notNull(),
    severity: text({ enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] }).notNull(), // severity of the alert
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
    repositoryId: int("repository_id")
      .notNull()
      .references(() => repositoryTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.repositoryId, t.year, t.month, t.day, t.severity],
    }),
  }),
);
