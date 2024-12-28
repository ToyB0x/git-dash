import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const filePath = "file:../../packages/db-shared/sqlite/shared.db";
const sqliteClient = createClient({ url: filePath });
export const sharedDbClient = drizzle({ client: sqliteClient });
