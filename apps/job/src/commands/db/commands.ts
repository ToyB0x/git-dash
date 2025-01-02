import { migrate } from "@/commands/db/migrate";
import { readConfigs } from "@/env";
import { Command } from "commander";
import { download } from "./download";

export const newDbCommand = () => {
  const dbCmd = new Command("db");
  dbCmd.description("db related commands.");

  dbCmd
    .command("download")
    .description("download db")
    .action(
      async () =>
        await download(
          readConfigs({
            // NOTE: 現時点でこのコマンドが直接使われるのはORGANIZATION_APPのみ
            GDASH_MODE: "ORGANIZATION_APP",
            env: process.env,
          }),
        ),
    );

  dbCmd
    .command("migrate")
    .description("migrate db")
    .action(() =>
      migrate(
        readConfigs({
          // NOTE: 現時点でこのコマンドが直接使われるのはORGANIZATION_APPのみ
          GDASH_MODE: "ORGANIZATION_APP",
          env: process.env,
        }),
      ),
    );

  return dbCmd;
};
