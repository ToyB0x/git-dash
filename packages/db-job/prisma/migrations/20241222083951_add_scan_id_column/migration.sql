/*
  Warnings:

  - You are about to drop the column `amount` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `cost` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scanId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scanId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expense_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("createdAt", "id") SELECT "createdAt", "id" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
