import process from "node:process";
import { styleText } from "node:util";
import { confirm, input } from "@inquirer/prompts";
import { Command } from "commander";

export const newPersonalCommand = () => {
  const personalCmd = new Command("personal");
  personalCmd.description("personal mode related commands.");

  personalCmd
    .command("*", { isDefault: true })
    .description("aggregate with personal mode")
    .action(async () => {
      const ghCommandSetupStatus = await confirm({
        message:
          "Did you already install Github CLI and set it up? (already run gh login ?)",
      });

      if (!ghCommandSetupStatus) {
        console.error(
          styleText("red", "Please install Github CLI and set it up first."),
        );
        process.exit(1);
      }

      const targetGithubOrg = await input({
        message: "Enter target github organization name",
      });

      console.log("targetGithubOrg", targetGithubOrg);

      console.info("done! 🎉🎉🎉");
    });

  return personalCmd;
};
