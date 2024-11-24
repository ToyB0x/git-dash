import { execSync } from "node:child_process";
import { getDbUrl } from "@repo/db-job";
import { getEnv } from "../../utils";
import { execWithScrubbedLog } from "./lib";

export const deploy = () => {
  const {
    APPS_DB_NAME,
    APPS_DB_PORT,
    APPS_JOBS_DB_USER_MIGRATION,
    APPS_JOBS_DB_PASS_MIGRATION,
  } = getEnv();
  const dbURL = getDbUrl({
    DB_NAME: APPS_DB_NAME,
    DB_PORT: APPS_DB_PORT,
    DB_USER: APPS_JOBS_DB_USER_MIGRATION,
    DB_PASS: APPS_JOBS_DB_PASS_MIGRATION,
    CONNECTION_LIMIT: 1,
  });
  execWithScrubbedLog(
    execSync,
    `DATABASE_URL="${dbURL}" yarn workspace @repo/db-job prisma migrate deploy`,
  );
};
