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
] as const

export const timelineTbl = sqliteTable("timeline", {
  id: int().primaryKey(), // github timeline id
  prId: int("pr_id").notNull(),
  actorId: int("actor_id").notNull(),
  eventType: text("event_type", {
    // ref: https://docs.github.com/ja/rest/using-the-rest-api/issue-event-types?apiVersion=2022-11-28
    enum: eventTypes,
  }).notNull(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
});
