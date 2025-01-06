import { Command } from "commander";
import { interactiveCommand } from "./interactive";

export const newSampleCommand = () => {
  const sampleCmd = new Command("sample");
  sampleCmd.description("sample mode related commands.");

  sampleCmd
    .command("interactive", { isDefault: true })
    .description(
      "Aggregate public or preferred organizational repositories using game-like points ui (only for fun, but you can use it for real)",
    )
    .action(async () => await interactiveCommand());

  return sampleCmd;
};
