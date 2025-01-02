import { Command } from "commander";
import { defaultCommand } from "./default";
import { showCommand } from "./show";

export const newPersonalCommand = () => {
  const personalCmd = new Command("personal");
  personalCmd.description("personal mode related commands.");

  personalCmd
    .command("*", { isDefault: true })
    .description("aggregate with personal mode")
    .action(async () => await defaultCommand());

  personalCmd
    .command("show")
    .description("show personal mode aggregated result")
    .action(async () => await showCommand());
};
