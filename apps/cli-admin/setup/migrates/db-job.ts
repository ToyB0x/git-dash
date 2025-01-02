import { execSync } from "node:child_process";

const withLog = (command: ReturnType<typeof execSync>) => {
  console.log(command.toString());
};

export const migrateDbJob = () => {
  withLog(execSync("pnpm --filter @git-dash/db-job generate"));
  withLog(execSync("pnpm --filter @git-dash/db-job build"));
  withLog(execSync("pnpm --filter @git-dash/db-job migrate:deploy"));
};
