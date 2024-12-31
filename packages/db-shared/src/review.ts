import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { prTbl } from "./pr";

export const reviewTbl = sqliteTable("review", {
  id: int().primaryKey(), // github review id
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  reviewerId: int("reviewer_id").notNull(), // 集計順序の都合でUserTblとのリレーションは持たない
  prId: int("pr_id")
    .notNull()
    .references(() => prTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
});
