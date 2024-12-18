import { generateDailyData } from "@/lib/generateDailyData";

type GraphData = {
  version: "0.1";
  type: "Critical" | "High" | "Low";
  data: {
    date: Date;
    value: number;
  }[];
};

export const dataLoaderVulnerabilityCritical = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Critical",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 10,
      max: 30,
      variance: 0.05,
      weekendReduction: false,
    }),
  };
};

export const dataLoaderVulnerabilityHigh = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "High",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 10,
      max: 50,
      variance: 0.05,
      weekendReduction: false,
    }),
  };
};

export const dataLoaderVulnerabilityLow = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Low",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 50,
      max: 120,
      variance: 0.5,
      weekendReduction: false,
    }),
  };
};
