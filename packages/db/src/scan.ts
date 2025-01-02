import { int, sqliteTable } from "drizzle-orm/sqlite-core";

export const scanTbl = sqliteTable("scan", {
  id: int().notNull().primaryKey(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
});
