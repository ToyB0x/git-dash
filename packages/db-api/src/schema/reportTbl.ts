import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";
import { groupTbl } from "./groupTbl";

// NOTE: same as Planet scale's choice
// ~919 years or 8B IDs needed, in order to have a 1% probability of at least one collision
// ref: https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api
const idLength = 12;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const reportTbl = sqliteTable(
  "report",
  {
    id: text({ length: idLength }).primaryKey(),
    status: text({
      enum: ["RUNNING", "FINISHED", "ABORTED", "FAILED"],
    }).notNull(),
    createdAt: integer({ mode: "timestamp_ms" }).notNull(),
    updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
    groupId: text("group_id")
      .notNull()
      .references(() => groupTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
  },
  (tbl) => ({
    idxGroupId: index("idx_report_group_id").on(tbl.groupId),
  }),
);

export const generateNewReportId = (): string => {
  const nanoid = customAlphabet(idAlphabet, idLength);
  return nanoid(); //=> "MSZTcPfZXoEN"
};
