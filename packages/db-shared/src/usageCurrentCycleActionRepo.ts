import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usageCurrentCycleActionRepoTbl = sqliteTable(
  "usage_current_cycle_action_repo",
  {
    id: int().primaryKey(),
    cost: int().notNull(),
    repoName: text("repo_name").notNull(),
    workflowName: text("workflow_name").notNull(),
    workflowPath: text("workflow_path").notNull(),
    runnerType: text("runner_type").notNull(),
    createdAt: int({ mode: "timestamp_ms" }).notNull(),
    updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  },
);
