import { logger, step } from "@/utils";
import { cost } from "./cost";
import { finalize } from "./finalize";
import { prepare } from "./prepare";
import { repositories } from "./repositories";
import { usage } from "./usage";

export const exportByWorkspace = async (): Promise<void> => {
  const { scanId, reportId } = await step({
    stepName: "export:prepare",
    callback: prepare(),
  });

  await step({
    stepName: "export:repositories",
    callback: repositories(reportId),
  });

  await step({
    stepName: "export:cost",
    callback: cost({ scanId, reportId }),
  });

  await step({
    stepName: "export:usage",
    callback: usage({ scanId, reportId }),
  });

  await step({
    stepName: "export:finalize",
    callback: finalize({ reportId }),
  });

  logger.info("Export Done!");
};
