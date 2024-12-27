import { relations } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userTbl } from "./userTbl";
import { workspaceTbl } from "./workspaceTbl";

export const usersToWorkspaces = sqliteTable(
  "users_to_workspaces",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspaceTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    role: text({ enum: ["OWNER", "ADMIN", "MEMBER"] }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
  }),
);

export const usersToWorkspacesRelations = relations(
  usersToWorkspaces,
  ({ one }) => ({
    workspace: one(workspaceTbl, {
      fields: [usersToWorkspaces.workspaceId],
      references: [workspaceTbl.id],
    }),
    user: one(userTbl, {
      fields: [usersToWorkspaces.userId],
      references: [userTbl.id],
    }),
  }),
);
