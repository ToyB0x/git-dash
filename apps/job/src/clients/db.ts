import type { Configs } from "@/env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// TODO: CLIとして配布しやすいようにパスを変更する
export const getDbPath = (configs: Configs) =>
  `../../packages/db-shared/sqlite/${configs.GDASH_WORKSPACE_ID}.db`;

export const getDbClient = (configs: Configs) => {
  const filePath = getDbPath(configs);
  const sqliteClient = createClient({ url: `file:${filePath}` });

  // if personal mode and no workspace id / no api key, use in-memory db (for avoiding file generation)
  // const sqliteClient = createClient({ url: ":memory:" });
  return drizzle({ client: sqliteClient });
};
