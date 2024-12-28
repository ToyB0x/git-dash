import { logger, step } from "@/utils";
import { db } from "./db";
import { finalize } from "./finalize";
import { prepare } from "./prepare";

export const exportByWorkspace = async (): Promise<void> => {
  const { reportId } = await step({
    stepName: "export:prepare",
    callback: prepare(),
    showUsage: false,
  });

  await step({
    stepName: "export:db",
    callback: db({ reportId }),
    showUsage: false,
  });

  await step({
    stepName: "export:finalize",
    callback: finalize({ reportId }),
    showUsage: false,
  });

  logger.info("Export Done!");
};
