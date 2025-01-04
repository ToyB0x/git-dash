import { execSync } from "node:child_process";
import { type Configs, GDASH_MODES } from "@/env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const getDbPath = (configs: Configs) =>
  configs.GDASH_MODE !== GDASH_MODES.SAMPLE
    ? `${process.cwd()}/${configs.GDASH_WORKSPACE_ID}.db`
    : `${process.cwd()}/sample-${configs.GDASH_GITHUB_ORGANIZATION_NAME}.db`;

export const getDbClient = (configs: Configs) => {
  const filePath = getDbPath(configs);

  // TODO: 全てのモードでマイグレーションの手順を共通化するようコードをリファクタする(現在は以下モードの時のみ暗黙的にマイグレーションしてしまっている)
  if (configs.GDASH_MODE === GDASH_MODES.SAMPLE) {
    // TODO: 現在はシンプルにPNPMの有無でコマンドを変えているが、本当はPNPMの有無＋アプリのワークスペース内にいるかを見ないといけないので後で改修する
    const hasPnpmCommand = !execSync("which pnpm").includes("not found");
    const command = hasPnpmCommand
      ? "pnpm --filter @git-dash/db db:migrate"
      : "npx @git-dash/db db:migrate";

    try {
      execSync(`DB_FILE_NAME=${filePath} ${command}`);
    } catch (e) {
      console.error(e);
    }
  }

  const sqliteClient = createClient({ url: `file:${filePath}` });
  return drizzle({ client: sqliteClient });
};
