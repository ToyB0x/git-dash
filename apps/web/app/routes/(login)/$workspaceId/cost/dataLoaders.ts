import { generateDailyData } from "@/lib/generateDailyData";

type GraphData = {
  version: "0.1";
  type: "Actions2Core" | "Actions4Core" | "Actions16Core";
  data: {
    date: Date;
    value: number;
  }[];
};

export const dataLoaderActions2Core = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Actions2Core",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 12,
      max: 50,
      variance: 0.04,
      weekendReduction: false,
    }),
  };
};

export const dataLoaderActions4Core = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Actions4Core",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 20,
      max: 40,
      variance: 0.01,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderActions16Core = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Actions16Core",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 30,
      max: 80,
      variance: 0.1,
      weekendReduction: true,
    }),
  };
};
