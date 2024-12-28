import { execSync } from "node:child_process";
import fs from "node:fs";
import { isBuffer } from "node:util";
import { filePath } from "@/clients";
import { logger } from "@/utils";

export const migrate = () => {
  try {
    logger.info("Migrating database file");
    const stdout = execSync("pnpm --filter @repo/db-shared db:migrate");
    logger.info(stdout.toString());
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } catch (e: any) {
    if (isBuffer(e.stdout)) logger.info(e.stdout.toString());
    if (isBuffer(e.stderr)) logger.error(e.stderr.toString());

    logger.error(
      "Failed to migrate database file, destroying(rename) the broken database file",
    );

    fs.renameSync(filePath, `${filePath}-bk-${Date.now()}`);
  }
};
