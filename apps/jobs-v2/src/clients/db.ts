import { PrismaClient } from "@repo/db-job";

export const dbClient = () => {
  return new PrismaClient();
};
