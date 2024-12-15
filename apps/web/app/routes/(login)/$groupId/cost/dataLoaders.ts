import { generateDailyData } from "@/lib/generateDailyData";
import type { GraphData } from "./data/schema";

export const dataLoaderActions = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Actions",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        // Date.now() - 60 /* 2month ago */ * 24 * 60 * 60 * 1000,
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 2500,
      max: 3700,
      variance: 0.01,
      weekendReduction: false,
    }),
  };
};
