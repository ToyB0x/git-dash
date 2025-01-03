import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { customAlphabet } from "nanoid";

// ~52 trillion years or 457,409,899T IDs needed, in order to have a 1% probability of at least one collision.
// ref: https://zelark.github.io/nano-id-cc/
const idLength = 24;
const idAlphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const reportSampleTbl = sqliteTable("report_sample", {
  // Use as report id and also sample workspace id
  id: text({ length: idLength }).primaryKey(),
  // Record IPs for future rate limits etc.
  ip: text().notNull(),
  createdAt: integer({ mode: "timestamp_ms" }).notNull(),
  updatedAt: integer({ mode: "timestamp_ms" }).notNull(),
});

// sample workspace id = sample report id
export const generateNewSampleWorkspaceId = (): string => {
  const nanoid = customAlphabet(idAlphabet, idLength);
  return nanoid(); //=> "MSZTcPfZXoEN"
};
