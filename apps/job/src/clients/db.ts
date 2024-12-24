import { createClient } from "@libsql/client";
import { PrismaClient } from "@repo/db-job";
import { drizzle } from "drizzle-orm/libsql";

export const dbClient = new PrismaClient();

const filePath = "../../packages/db-shared/sqlite/shared.db";
const sqliteClient = createClient({ url: filePath });
export const sharedDbClient = drizzle({ client: sqliteClient });
