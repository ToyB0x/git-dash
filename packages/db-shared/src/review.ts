import { int, sqliteTable } from "drizzle-orm/sqlite-core";

export const reviewTbl = sqliteTable("review", {
  id: int().primaryKey(), // github review id
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  reviewerId: int("reviewer_id").notNull(), // 集計順序の都合でUserTblとのリレーションは持たない
  prId: int("pr_id").notNull(), // 集計順序を柔軟に変更できるようprTblとのリレーションは持たない(一定期間経過後、それぞれ独立してレコード削除するので問題ない)
});
