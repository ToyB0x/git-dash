import { logger } from "@/utils/logger";

type Options<T> = {
  stepName: string;
  callback: Promise<T>;
};

export const step = async <T>(options: Options<T>): Promise<T> => {
  logger.info(`Start ${options.stepName}`);
  try {
    const result = await options.callback;
    logger.info(`Finish ${options.stepName}`);
    return result;
  } catch (e) {
    logger.error(`Failed ${options.stepName}`);
    throw e;
  }
};
