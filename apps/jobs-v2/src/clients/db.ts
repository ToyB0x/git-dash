import { PrismaClient } from "@repo/db-job";

export const db = () => {
  return new PrismaClient();
};
