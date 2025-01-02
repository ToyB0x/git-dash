import { execSync } from "node:child_process";
import type { Configs } from "@/env";
import { logger } from "@/utils";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// TODO: CLIとして配布しやすいようにパスを変更する
export const getDbPath = (configs: Configs) =>
  configs.GDASH_MODE !== "PERSONAL" && configs.GDASH_MODE !== "PERSONAL_SAMPLE"
    ? `../../packages/db-shared/sqlite/${configs.GDASH_WORKSPACE_ID}.db`
    : `../../packages/db-shared/sqlite/personal-${configs.GDASH_GITHUB_ORGANIZATION_NAME}.db`;

export const getDbClient = (configs: Configs) => {
  const filePath = getDbPath(configs);

  if (configs.GDASH_MODE === "PERSONAL") {
    logger.debug("Migrating database file");
    const stdout = execSync(
      `DB_FILE_NAME=${filePath} pnpm --filter @git-dash/db-shared db:migrate`,
    );
    logger.debug(stdout.toString());
  }

  const sqliteClient = createClient({ url: `file:${filePath}` });
  return drizzle({ client: sqliteClient });
};
