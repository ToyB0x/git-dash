/*
  Warnings:

  - You are about to drop the column `pushedAt` on the `Repository` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Repository` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "hasVulnerabilityAlertsEnabled" BOOLEAN,
    "vulnerabilityAlertsTotalCount" INTEGER,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Repository_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Repository" ("hasVulnerabilityAlertsEnabled", "id", "name", "organizationId", "vulnerabilityAlertsTotalCount") SELECT "hasVulnerabilityAlertsEnabled", "id", "name", "organizationId", "vulnerabilityAlertsTotalCount" FROM "Repository";
DROP TABLE "Repository";
ALTER TABLE "new_Repository" RENAME TO "Repository";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
