import { execSync } from "node:child_process";
import {
  generateNewUserId,
  userTbl,
  usersToWorkspaces,
  workspaceTbl,
} from "@git-dash/db-api/schema";
import { drizzle } from "drizzle-orm/libsql";
import { SampleUser } from "../constants/user";

export const insertApiSeed = async () => {
  const DB_URL = execSync(
    "find ../../.emu-cloudflare/v3/d1/miniflare-D1DatabaseObject -type f -name '*.sqlite' -print -quit",
  )
    .toString()
    .trim();

  const db = drizzle(`file:${DB_URL}`);

  // create sign-up user
  const createUserResults = await db
    .insert(userTbl)
    .values({
      id: generateNewUserId(),
      email: SampleUser.email,
      firebaseUid: SampleUser.uid,
    })
    .returning();

  const createdUser1 = createUserResults[0];
  if (!createdUser1) throw Error("Failed to create user");

  // create workspace
  const createWorkspaceResults = await db
    .insert(workspaceTbl)
    .values({
      id: "workspace1",
      displayName: "workspace1",
      apiTokenHash:
        "54fe6a71662a7252e946d1375c3c8846c64eaef341fca6b02a8cc1cdd327a352", // hash of "LOCAL_API_TOKEN"
    })
    .returning();

  const createdWorkspace1 = createWorkspaceResults[0];
  if (!createdWorkspace1) throw Error("Failed to create workspace");

  // join user to workspace as owner
  await db.insert(usersToWorkspaces).values({
    userId: createdUser1.id,
    workspaceId: createdWorkspace1.id,
    role: "OWNER",
  });

  console.info("Insert Seed to API DB complete 🎉");
};
