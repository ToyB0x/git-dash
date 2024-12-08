import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

// NOTE: same as Planet scale's choice
// ~919 years or 8B IDs needed, in order to have a 1% probability of at least one collision
// ref: https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api
const idLength = 12;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const reportTbl = sqliteTable("report", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: false }),
  publicId: text("public_id", { length: idLength }).unique(
    "uq_report_public_id",
  ),
  status: text({
    enum: ["RUNNING", "FINISHED", "ABORTED", "FAILED"],
  }).notNull(),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
});

export const generateNewReportId = (): string => {
  const nanoid = customAlphabet(idAlphabet, idLength);
  return nanoid(); //=> "MSZTcPfZXoEN"
};
