import { relations } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { userTbl } from "./userTbl";
import { workspaceTbl } from "./workspaceTbl";

export const Roles = [
  "OWNER", // can do anything
  "MANAGER", // cav view advanced information (can't invite new members?)
  "MEMBER", // can view basic information
] as const;

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
    role: text({
      enum: Roles,
    }).notNull(),
    createdAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .$onUpdate(() => new Date()),
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