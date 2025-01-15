import { execSync } from "node:child_process";
import { type Configs, GDASH_MODES } from "@/env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const getDbPath = (configs: Configs) =>
  `${process.cwd()}/${configs.GDASH_WORKSPACE_ID}.db`;

export const getDbClient = (configs: Configs) => {
  const filePath = getDbPath(configs);
  const sqliteClient = createClient({ url: `file:${filePath}` });
  return drizzle({ client: sqliteClient });
};
