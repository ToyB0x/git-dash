/*
  Warnings:

  - You are about to drop the `ActionUsage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ActionUsage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ActionUsageCurrentCycle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanId" INTEGER NOT NULL,
    "runnerType" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActionUsageCurrentCycle_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
