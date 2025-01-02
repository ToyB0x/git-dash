import { getDbClient, getHonoClient } from "@/clients";
import type { Configs } from "@/env";
import { exportDbFile, logger } from "@/utils";

export const exportByWorkspace = async (configs: Configs): Promise<void> => {
  const hc = getHonoClient(configs);
  const dbClient = getDbClient(configs);

  const exportedFile = await exportDbFile({ dbClient, configs });

  await honoClient["public-api"].db.$post({
    form: {
      file: exportedFile,
    },
  });

  logger.info("Export Done!");
};
