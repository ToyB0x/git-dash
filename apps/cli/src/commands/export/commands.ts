import process from "node:process";
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
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          GDASH_MODE: process.env["GDASH_MODE"],
          env: process.env,
        }),
      );
    });

  return exportCmd;
};
