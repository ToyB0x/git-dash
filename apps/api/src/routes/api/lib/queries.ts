import { userTbl, usersToWorkspaces } from "@git-dash/db-api/schema";
import { and, eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export const getDbUserFromToken = async (uid: string, db: DrizzleD1Database) =>
  await db.select().from(userTbl).where(eq(userTbl.firebaseUid, uid)).get();

export const getIsBelongingWorkspace = async ({
  userId,
  workspaceId,
  db,
}: {
  userId: string;
  workspaceId: string;
  db: DrizzleD1Database;
}) =>
  !!(await db
    .select()
    .from(usersToWorkspaces)
    .where(
      and(
        eq(usersToWorkspaces.userId, userId),
        eq(usersToWorkspaces.workspaceId, workspaceId),
      ),
    )
    .get());
