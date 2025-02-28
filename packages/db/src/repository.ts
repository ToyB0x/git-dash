import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const repositoryTbl = sqliteTable("repository", {
  id: int().primaryKey(), // github repository id
  name: text("name").notNull(), // repo name (ex. drizzle-core section of "@drizzle-org/drizzle-core")
  owner: text("owner").notNull(), // owner login name
  enabledAlert: int("enabled_alert", { mode: "boolean" }),
  enabledAlertCheckedAt: int("enabled_alert_checked_at", {
    mode: "timestamp_ms",
  }),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  createdAtGithub: int({ mode: "timestamp_ms" }),
  updatedAtGithub: int({ mode: "timestamp_ms" }),
  // 実運用上scanIdではなく、updatedAtでの集計を行うためリレーションは持たない
  // scanId: int()
  //   .notNull()
  //   .references(() => scanTbl.id, {
  //     onUpdate: "cascade",
  //     onDelete: "cascade",
  //   }),
});
