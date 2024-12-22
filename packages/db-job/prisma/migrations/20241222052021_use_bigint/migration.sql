/*
  Warnings:

  - You are about to alter the column `workflowId` on the `WorkflowUsageRepo` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `workflowId` on the `WorkflowUsageRepoDaily` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkflowUsageRepo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanId" INTEGER NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "workflowId" BIGINT NOT NULL,
    "runner" TEXT NOT NULL,
    "totalMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowUsageRepo_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkflowUsageRepo_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkflowUsageRepo" ("createdAt", "id", "repositoryId", "runner", "scanId", "totalMs", "workflowId") SELECT "createdAt", "id", "repositoryId", "runner", "scanId", "totalMs", "workflowId" FROM "WorkflowUsageRepo";
DROP TABLE "WorkflowUsageRepo";
ALTER TABLE "new_WorkflowUsageRepo" RENAME TO "WorkflowUsageRepo";
CREATE TABLE "new_WorkflowUsageRepoDaily" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanId" INTEGER NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "workflowId" BIGINT NOT NULL,
    "workflowName" TEXT NOT NULL,
    "workflowPath" TEXT NOT NULL,
    "queryString" TEXT NOT NULL,
    "totalMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowUsageRepoDaily_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkflowUsageRepoDaily_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkflowUsageRepoDaily" ("createdAt", "id", "queryString", "repositoryId", "scanId", "totalMs", "workflowId", "workflowName", "workflowPath") SELECT "createdAt", "id", "queryString", "repositoryId", "scanId", "totalMs", "workflowId", "workflowName", "workflowPath" FROM "WorkflowUsageRepoDaily";
DROP TABLE "WorkflowUsageRepoDaily";
ALTER TABLE "new_WorkflowUsageRepoDaily" RENAME TO "WorkflowUsageRepoDaily";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
