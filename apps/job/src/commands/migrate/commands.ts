import { Command } from "commander";
import { deploy } from "./deploy";
import { status } from "./status";

export const makeMigrateCommand = () => {
  const migrate = new Command("migrate");
  migrate.description("migrate related commands.");

  migrate
    .command("status")
    .description("show migrate status")
    .action(() => status());

  migrate
    .command("deploy")
    .description("deploy migration")
    .action(() => deploy());

  return migrate;
};
