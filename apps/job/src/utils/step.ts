import { logger } from "@/utils/logger";

type Options<T> = {
  stepName: string;
  callback: Promise<T>;
};

export const step = async <T>(options: Options<T>): Promise<T> => {
  logger.info(`Start ${options.stepName}`);
  const result = await options.callback;
  logger.info(`Finish ${options.stepName}`);
  return result;
};
