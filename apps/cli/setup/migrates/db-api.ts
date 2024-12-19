import { execSync } from "node:child_process";

const withLog = (command: ReturnType<typeof execSync>) => {
  console.log(command.toString());
};

export const migrateDbApi = () => {
  withLog(execSync("pnpm --filter @repo/db-api db:reset:local"));
};
