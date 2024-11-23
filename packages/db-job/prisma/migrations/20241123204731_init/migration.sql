-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "login" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT NOT NULL,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hasVulnerabilityAlertsEnabled" BOOLEAN NOT NULL,
    "vulnerabilityAlertsTotalCount" INTEGER NOT NULL,
    "pushedAt" DATETIME,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Repository_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "Release_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pr" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changedFiles" INTEGER NOT NULL,
    "commentsTotalCount" INTEGER NOT NULL,
    "merged" BOOLEAN NOT NULL,
    "closed" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "mergedAt" DATETIME,
    CONSTRAINT "Pr_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pr_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pr_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "committedDate" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Commit_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Commit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "prId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_prId_fkey" FOREIGN KEY ("prId") REFERENCES "Pr" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "prId" TEXT NOT NULL,
    "requestUserId" TEXT NOT NULL,
    "requestedUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewRequest_requestUserId_fkey" FOREIGN KEY ("requestUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewRequest_requestedUserId_fkey" FOREIGN KEY ("requestedUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewRequest_prId_fkey" FOREIGN KEY ("prId") REFERENCES "Pr" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_login_key" ON "Organization"("login");

-- CreateIndex
CREATE INDEX "Pr_organizationId_createdAt_idx" ON "Pr"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Commit_organizationId_committedDate_idx" ON "Commit"("organizationId", "committedDate");

-- CreateIndex
CREATE INDEX "Review_organizationId_authorId_idx" ON "Review"("organizationId", "authorId");

-- CreateIndex
CREATE INDEX "ReviewRequest_organizationId_requestedUserId_idx" ON "ReviewRequest"("organizationId", "requestedUserId");
