import process from "node:process";
import { readConfigs } from "@/env";
import { Command } from "commander";

export const newCheckCommand = () => {
  const checkCmd = new Command("check");
  checkCmd.description("check related commands.");

  checkCmd
    .command("config")
    .description("check command envs")
    .action(async () => {
      console.info("Checking envs...");

      // NOTE: 現在 config check は ORGANIZATION_APP のみをサポートしている (Personal mode は対話式で確認するのでチェックコマンド不要)
      readConfigs({
        // biome-ignore lint/complexity/useLiteralKeys: <explanation>
        GDASH_MODE: process.env["GDASH_MODE"],
        env: process.env,
      });

      console.info("Envs are set correctly 🎉🎉🎉");
      process.exit(0);
    });

  return checkCmd;
};
