import { generateDailyData } from "@/lib/generateDailyData";

type GraphData = {
  version: "0.1";
  type: "ReviewTime";
  data: {
    date: Date;
    value: number;
  }[];
};

export const dataLoaderReviewTime = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "ReviewTime",
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
