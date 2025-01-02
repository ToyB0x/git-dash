import { execSync } from "node:child_process";
import fs from "node:fs";
import { getDbPath } from "@/clients";
import type { Configs } from "@/env";
import { logger } from "@/utils";

export const migrate = (configs: Configs) => {
  const filePath = getDbPath(configs);

  // TODO: 全てのモードでマイグレーションの手順を共通化するようコードをリファクタする
  // (現在はactionsを使う時はpnpm workspaceコマンド、パブリッシュしたcli利用時はnpxを利用する形に分岐してしまっている)
  try {
    logger.info("Migrating database file");
    const stdout = execSync(
      `DB_FILE_NAME=${filePath} pnpm --filter @git-dash/db db:migrate`,
    );
    logger.info(stdout.toString());
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (e: any) {
    if (Buffer.isBuffer(e.stdout)) logger.info(e.stdout.toString());
    if (Buffer.isBuffer(e.stderr)) logger.error(e.stderr.toString());

    logger.error(
      "Failed to migrate database file, destroying(rename) the broken database file",
    );

    fs.renameSync(filePath, `${filePath}-bk-${Date.now()}`);

    logger.info("Createing new database file");
    const stdout = execSync(
      `DB_FILE_NAME=${filePath} pnpm --filter @git-dash/db db:migrate`,
    );
    logger.info(stdout.toString());
  }
};
