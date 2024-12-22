/*
  Warnings:

  - You are about to drop the column `runnreType` on the `ActionUsage` table. All the data in the column will be lost.
  - Added the required column `runnerType` to the `ActionUsage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionUsage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanId" INTEGER NOT NULL,
    "runnerType" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActionUsage_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActionUsage" ("cost", "createdAt", "id", "scanId") SELECT "cost", "createdAt", "id", "scanId" FROM "ActionUsage";
DROP TABLE "ActionUsage";
ALTER TABLE "new_ActionUsage" RENAME TO "ActionUsage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
