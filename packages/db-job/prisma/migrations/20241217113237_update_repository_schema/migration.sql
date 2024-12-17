-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hasVulnerabilityAlertsEnabled" BOOLEAN,
    "vulnerabilityAlertsTotalCount" INTEGER,
    "pushedAt" DATETIME,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Repository_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Repository" ("hasVulnerabilityAlertsEnabled", "id", "name", "organizationId", "pushedAt", "vulnerabilityAlertsTotalCount") SELECT "hasVulnerabilityAlertsEnabled", "id", "name", "organizationId", "pushedAt", "vulnerabilityAlertsTotalCount" FROM "Repository";
DROP TABLE "Repository";
ALTER TABLE "new_Repository" RENAME TO "Repository";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
