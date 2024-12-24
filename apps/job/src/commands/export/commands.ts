import { Command } from "commander";
import { exportByWorkspace } from "./export";

export const newExportCommand = () => {
  const exportCmd = new Command("export");
  exportCmd.description("exporter related commands.");

  exportCmd
    .command("workspace")
    .description("export specific organization summary")
    .action(async () => {
      await exportByWorkspace();
    });

  return exportCmd;
};
