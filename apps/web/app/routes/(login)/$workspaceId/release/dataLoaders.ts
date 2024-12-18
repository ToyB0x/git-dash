import { generateDailyData } from "@/lib/generateDailyData";

type GraphData = {
  version: "0.1";
  type: "Release";
  data: {
    date: Date;
    value: number;
  }[];
};

export const dataLoaderRelease = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Release",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 6,
      variance: 2.5,
      weekendReduction: true,
    }),
  };
};
