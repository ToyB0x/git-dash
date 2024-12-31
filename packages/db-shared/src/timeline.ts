import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const eventTypes = [
  "closed",
  "commented",
  "committed",
  "merged",
  "ready_for_review",
  "review_requested",
  "review_request_removed",
  "reviewed",
] as const;

export const timelineTbl = sqliteTable("timeline", {
  id: int().primaryKey(), // github timeline id
  prId: int("pr_id").notNull(), // 集計順序を柔軟に変更できるようprTblとのリレーションは持たない(一定期間経過後、それぞれ独立してレコード削除するので問題ない)
  actorId: int("actor_id").notNull(), // 集計順序の都合でUserTblとのリレーションは持たない
  requestedReviewerId: int("requested_reviewer_id"), // event_typeがreview_requestedの場合のみ
  eventType: text("event_type", {
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/issue-event-types?apiVersion=2022-11-28
    enum: eventTypes,
  }).notNull(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
});
