import { PrismaClient } from "@repo/db-job";

export const getSingleTenantPrismaClient = () => {
  return new PrismaClient();
};
