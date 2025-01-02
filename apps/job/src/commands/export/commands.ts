import { readConfigs } from "@/env";
import { Command } from "commander";
import { exportByWorkspace } from "./export";

export const newExportCommand = () => {
  const exportCmd = new Command("export");
  exportCmd.description("exporter related commands.");

  exportCmd
    .command("workspace")
    .description("export specific organization summary")
    .action(async () => {
      await exportByWorkspace(
        readConfigs({
          // NOTE: 既存のこのコマンドから呼び出すのはORGANIZATION_APPのみ
          GDASH_MODE: "ORGANIZATION_APP",
          env: process.env,
        }),
      );
    });

  return exportCmd;
};
