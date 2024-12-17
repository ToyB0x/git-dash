import { Command } from "commander";

export const newExportCommand = () => {
  const exportCmd = new Command("export");
  exportCmd.description("exporter related commands.");

  exportCmd
    .command("group")
    .description("export specific organization summary");
  // .action(async () => {
  //   await exportByOrganization(
  //     env.GDASH_GITHUB_ORGANIZATION_NAME,
  //     env.GDASH_GROUP_ID,
  //     env.GDASH_GROUP_API_KEY,
  //   );
  // });

  return exportCmd;
};
