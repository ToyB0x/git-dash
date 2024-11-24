import { PrismaClient, getDbUrl } from "@repo/db-job";
import { getEnv } from "../env";

export const getSingleTenantPrismaClient = () => {
  const {
    APPS_DB_NAME,
    APPS_DB_PORT,
    APPS_DB_USER_RLS_ENABLED,
    APPS_DB_PASS_RLS_ENABLED,
  } = getEnv();

  const dbUrl = getDbUrl({
    DB_NAME: APPS_DB_NAME,
    DB_PORT: APPS_DB_PORT,
    DB_USER: APPS_DB_USER_RLS_ENABLED,
    DB_PASS: APPS_DB_PASS_RLS_ENABLED,
    CONNECTION_LIMIT: 1,
  });

  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
};
