export type Usage = {
  owner: string;
  status: string;
  costs: number;
  region: string;
  stability: number;
  lastEdited: string;
};

export type OverviewData = {
  date: string;
  Actions: number;
  "Rows read": number;
  Queries: number;
  "Payments completed": number;
  Seats: number;
  Copilots: number;
};
