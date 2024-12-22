-- CreateTable
CREATE TABLE "WorkflowUsageRepoDaily" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanId" INTEGER NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "workflowName" TEXT NOT NULL,
    "workflowPath" TEXT NOT NULL,
    "queryString" TEXT NOT NULL,
    "totalMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowUsageRepoDaily_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkflowUsageRepoDaily_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
