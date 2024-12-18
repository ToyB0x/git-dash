import { generateDailyData } from "@/lib/generateDailyData";

type GraphData = {
  version: "0.1";
  type: "PrOpen" | "PrMerge";
  data: {
    date: Date;
    value: number;
  }[];
};

export const dataLoaderPrOpen = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "PrOpen",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 5,
      max: 30,
      variance: 2.5,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderPrMerge = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "PrMerge",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 5,
      max: 30,
      variance: 2.5,
      weekendReduction: true,
    }),
  };
};
