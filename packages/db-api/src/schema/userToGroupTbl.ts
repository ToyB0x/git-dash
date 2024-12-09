import { relations } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { groupTbl } from "./groupTbl";
import { userTbl } from "./userTbl";

export const usersToGroups = sqliteTable(
  "users_to_groups",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    groupId: text("group_id")
      .notNull()
      .references(() => groupTbl.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    role: text({ enum: ["OWNER", "MEMBER"] }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.groupId] }),
  }),
);

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groupTbl, {
    fields: [usersToGroups.groupId],
    references: [groupTbl.id],
  }),
  user: one(userTbl, {
    fields: [usersToGroups.userId],
    references: [userTbl.id],
  }),
}));
