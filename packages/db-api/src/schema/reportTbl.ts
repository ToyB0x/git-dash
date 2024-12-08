import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reportTbl = sqliteTable("report", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: false }),
  status: text({
    enum: ["RUNNING", "FINISHED", "ABORTED", "FAILED"],
  }).notNull(),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
});
