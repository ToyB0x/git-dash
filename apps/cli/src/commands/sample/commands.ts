import { Command } from "commander";
import { defaultCommand } from "./default";
import { interactiveCommand } from "./interactive";
import { showCommand } from "./show";

export const newSampleCommand = () => {
  const sampleCmd = new Command("sample");
  sampleCmd.description("sample mode related commands.");

  sampleCmd
    .command("*", { isDefault: true })
    .description("aggregate with sample mode")
    .action(async () => await defaultCommand());

  sampleCmd
    .command("interactive")
    .description(
      "Aggregate public or preferred organizational repositories using game-like points ui (only for fun, but you can use it for real)",
    )
    .action(async () => await interactiveCommand());

  sampleCmd
    .command("show")
    .description("show sample mode aggregated result")
    .action(async () => await showCommand());

  return sampleCmd;
};
