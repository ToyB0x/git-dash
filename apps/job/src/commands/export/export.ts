import { logger, step } from "@/utils";
import { db } from "./db";
import { finalize } from "./finalize";
import { prepare } from "./prepare";

export const exportByWorkspace = async (): Promise<void> => {
  const { reportId } = await step({
    stepName: "export:prepare",
    callback: prepare(),
  });

  await step({
    stepName: "export:db",
    callback: db({ reportId }),
  });

  await step({
    stepName: "export:finalize",
    callback: finalize({ reportId }),
  });

  logger.info("Export Done!");
};
