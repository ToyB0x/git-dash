type Options<T> = {
  stepName: string;
  callback: Promise<T>;
};

export const step = async <T>(options: Options<T>): Promise<T> => {
  console.log(`Start ${options.stepName}`);
  const result = await options.callback;
  console.log(`Finish ${options.stepName}`);
  return result;
};
