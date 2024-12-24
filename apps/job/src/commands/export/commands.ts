import { Command } from "commander";
import { exportByOrganization } from "./export";

export const newExportCommand = () => {
  const exportCmd = new Command("export");
  exportCmd.description("exporter related commands.");

  exportCmd
    .command("group")
    .description("export specific organization summary")
    .action(async () => {
      await exportByOrganization();
    });

  return exportCmd;
};
