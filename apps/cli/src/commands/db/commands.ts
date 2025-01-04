import process from "node:process";
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
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            GDASH_MODE: process.env["GDASH_MODE"],
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
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          GDASH_MODE: process.env["GDASH_MODE"],
          env: process.env,
        }),
      ),
    );

  return dbCmd;
};
