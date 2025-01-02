import { Command } from "commander";
import { defaultCommand } from "./default";
import { showCommand } from "./show";

export const newSampleCommand = () => {
  const sampleCmd = new Command("sample");
  sampleCmd.description("sample mode related commands.");

  sampleCmd
    .command("*", { isDefault: true })
    .description("aggregate with sample mode")
    .action(async () => await defaultCommand());

  sampleCmd
    .command("show")
    .description("show sample mode aggregated result")
    .action(async () => await showCommand());

  return sampleCmd;
};
