import process from "node:process";
import { Command, Option } from "commander";
import { exportByOrganization } from "./exportByOrganization";

export const makeExportCommand = () => {
  const exportCmd = new Command("export");
  exportCmd.description("exporter related commands.");

  exportCmd
    .command("group")
    .description("export specific organization summary")
    .addOption(
      new Option(
        "--githubOrganizationName <string>",
        "Target Github Organization",
      ).env("GDASH_GITHUB_ORGANIZATION_NAME"),
    )
    .addOption(
      new Option("--groupId <string>", "G-dash Group ID").env("GDASH_GROUP_ID"),
    )
    .addOption(
      new Option("--groupApiKey <string>", "G-dash Group API Key").env(
        "GDASH_GROUP_API_KEY",
      ),
    )
    .action(async (options) => {
      const { githubOrganizationName, groupId, groupApiKey } = options;

      if (!githubOrganizationName || !groupId || !groupApiKey)
        throw new Error(
          "Invalid arguments, confirm githubOrganizationName, groupId, and groupApiKey are set",
        );

      await exportByOrganization(githubOrganizationName, groupId, groupApiKey);
    });

  exportCmd
    .command("check")
    .description("check command envs")
    .addOption(
      new Option(
        "--githubOrganizationName <string>",
        "Target Github Organization",
      ).env("GDASH_GITHUB_ORGANIZATION_NAME"),
    )
    .addOption(
      new Option("--groupId <string>", "G-dash Group ID").env("GDASH_GROUP_ID"),
    )
    .addOption(
      new Option("--groupApiKey <string>", "G-dash Group API Key").env(
        "GDASH_GROUP_API_KEY",
      ),
    )
    .action(async (options) => {
      const { githubOrganizationName, groupId, groupApiKey } = options;

      if (!githubOrganizationName || !groupId || !groupApiKey)
        throw new Error(
          "Invalid arguments, confirm githubOrganizationName, groupId, and groupApiKey are set",
        );

      console.info("Envs are set correctly 🎉🎉🎉");
      process.exit(0);
    });

  return exportCmd;
};
