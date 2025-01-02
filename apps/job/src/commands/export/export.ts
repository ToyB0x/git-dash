import { getHonoClient } from "@/clients";
import type { Configs } from "@/env";
import { logger, step } from "@/utils";
import { db } from "./db";
import { finalize } from "./finalize";
import { prepare } from "./prepare";

export const exportByWorkspace = async (configs: Configs): Promise<void> => {
  const hc = getHonoClient(configs);

  const { reportId } = await step({
    configs,
    stepName: "export:prepare",
    callback: prepare(hc, configs),
    showUsage: false,
  });

  await step({
    configs,
    stepName: "export:db",
    callback: db({ reportId, configs, honoClient: hc }),
    showUsage: false,
  });

  await step({
    configs,
    stepName: "export:finalize",
    callback: finalize({ hc, reportId, configs }),
    showUsage: false,
  });

  logger.info("Export Done!");
};
