import process from "node:process";
import { env } from "@/env";
import { Command } from "commander";

export const newCheckCommand = () => {
  const checkCmd = new Command("check");
  checkCmd.description("check related commands.");

  checkCmd
    .command("config")
    .description("check command envs")
    .action(async () => {
      console.info("Checking envs...");
      // parse and validate envs
      env;
      console.info("Envs are set correctly 🎉🎉🎉");
      process.exit(0);
    });

  return checkCmd;
};
