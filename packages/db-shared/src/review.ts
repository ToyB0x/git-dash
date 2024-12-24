import { int, sqliteTable } from "drizzle-orm/sqlite-core";

export const reviewTbl = sqliteTable("review", {
  id: int().primaryKey(), // github review id
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  reviewerId: int("reviewer_id").notNull(),
  prId: int("pr_id"),
});
