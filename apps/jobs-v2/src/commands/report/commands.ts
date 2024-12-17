import process from "node:process";
import { Command } from "commander";

export const newReportCommand = () => {
  const checkCmd = new Command("Report");
  checkCmd.description("report related commands.");

  checkCmd
    .command("config")
    .description("report command envs")
    .action(async () => {
      console.warn("Implement the report command");
      process.exit(0);
    });

  return checkCmd;
};
