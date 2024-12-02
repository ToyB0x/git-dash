import { Command } from "commander";
import { exportByOrganization } from "./exportByOrganization";

export const makeExportCommand = () => {
  const exportCmd = new Command("export");
  exportCmd.description("exporter related commands.");

  exportCmd
    .command("organization")
    .description("export specific organization summary")
    .argument("<orgName>", "orgName to export summary")
    .action(async (orgName: string) => exportByOrganization(orgName));

  return exportCmd;
};
