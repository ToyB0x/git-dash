import { env } from "@/env";
import { Command } from "commander";
import { exportByOrganization } from "./export";

export const newExportCommand = () => {
  const exportCmd = new Command("export");
  exportCmd.description("exporter related commands.");

  exportCmd
    .command("group")
    .description("export specific organization summary")
    .action(async () => {
      await exportByOrganization(env.GDASH_WORKSPACE_ID);
    });

  return exportCmd;
};
