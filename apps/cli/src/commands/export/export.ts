import { getHonoClient } from "@/clients";
import type { Configs } from "@/env";
import { logger, step } from "@/utils";
import { db } from "./db";

export const exportByWorkspace = async (configs: Configs): Promise<void> => {
  const hc = getHonoClient(configs);

  await step({
    configs,
    stepName: "export:db",
    callback: db({ configs, honoClient: hc }),
    showUsage: false,
  });

  logger.info("Export Done!");
};
