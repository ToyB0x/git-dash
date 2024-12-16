import { generateDailyData } from "@/lib/generateDailyData";

type GraphData = {
  version: "0.1";
  type:
    | "PrOpen"
    | "PrMerge"
    | "Reviews"
    | "Release"
    | "ChangeLeadTime"
    | "ChangeFailureRate"
    | "FailedDeploymentRecoveryTime";
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
      min: 1,
      max: 5,
      variance: 1,
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
      min: 1,
      max: 5,
      variance: 1,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderReviews = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "Reviews",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 15,
      variance: 1,
      weekendReduction: true,
    }),
  };
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

export const dataLoaderChangeLeadTime = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "ChangeLeadTime",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 10,
      max: 50,
      variance: 0.01,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderChangeFailureRate = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "ChangeFailureRate",
    version: "0.1",
    data: generateDailyData({
      startDate: new Date(
        Date.now() - 800 /* 2years ago */ * 24 * 60 * 60 * 1000,
      ),
      endDate: new Date(),
      min: 1,
      max: 8,
      variance: 0.3,
      weekendReduction: true,
    }),
  };
};

export const dataLoaderFailedDeploymentRecoveryTime = async (
  _isDemo: boolean,
): Promise<GraphData> => {
  return {
    type: "FailedDeploymentRecoveryTime",
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
