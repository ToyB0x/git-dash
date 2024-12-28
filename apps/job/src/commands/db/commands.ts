import { migrate } from "@/commands/db/migrate";
import { Command } from "commander";
import { download } from "./download";

export const newDbCommand = () => {
  const dbCmd = new Command("db");
  dbCmd.description("db related commands.");

  dbCmd
    .command("download")
    .description("download db")
    .action(async () => await download());

  dbCmd.command("migrate").description("migrate db").action(migrate);

  return dbCmd;
};
