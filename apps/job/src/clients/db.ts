import { env } from "@/env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const filePath = `../../packages/db-shared/sqlite/${env.GDASH_WORKSPACE_ID}.db`;
const sqliteClient = createClient({ url: `file:${filePath}` });
export const sharedDbClient = drizzle({ client: sqliteClient });
