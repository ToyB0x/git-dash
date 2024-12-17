import process from "node:process";
import { Command, Option } from "commander";

export const newCheckCommand = () => {
  const checkCmd = new Command("check");
  checkCmd.description("check related commands.");

  checkCmd
    .command("config")
    .description("check command envs")
    .addOption(
      new Option(
        "--githubOrganizationName <string>",
        "Target Github Organization",
      ).env("GDASH_GITHUB_ORGANIZATION_NAME"),
    )
    .addOption(
      new Option(
        "--githubPersonalAccessToken <string>",
        "Your Github Personal Access Token",
      ).env("GDASH_GITHUB_PERSONAL_ACCESS_TOKEN"),
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
      const {
        githubOrganizationName,
        githubPersonalAccessToken,
        groupId,
        groupApiKey,
      } = options;

      if (
        !githubOrganizationName ||
        !githubPersonalAccessToken ||
        !groupId ||
        !groupApiKey
      )
        throw new Error(
          "Invalid arguments, confirm githubOrganizationName, groupId, and groupApiKey are set",
        );

      console.info("Envs are set correctly 🎉🎉🎉");
      process.exit(0);
    });

  return checkCmd;
};
