import { int, sqliteTable } from "drizzle-orm/sqlite-core";
import { scanTbl } from "./scan";

export const billingCycleTbl = sqliteTable("billing_cycle", {
  scanId: int()
    .notNull()
    .primaryKey()
    .references(() => scanTbl.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  daysLeft: int("days_left").notNull(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
});
