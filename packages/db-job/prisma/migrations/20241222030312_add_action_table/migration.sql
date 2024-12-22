-- CreateTable
CREATE TABLE "Scan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WorkflowUsageRepo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanId" INTEGER NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "workflowId" INTEGER NOT NULL,
    "runner" TEXT NOT NULL,
    "totalMs" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowUsageRepo_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkflowUsageRepo_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
