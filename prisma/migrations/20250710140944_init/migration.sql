-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VisitorRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "visitorName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleNo" TEXT,
    "additionalVisitors" INTEGER NOT NULL,
    "visitDate" DATETIME NOT NULL,
    "visitTime" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "guestHouse" BOOLEAN NOT NULL,
    "guestHouseApprovalEmail" TEXT,
    "status" TEXT NOT NULL,
    "qrCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "VisitorRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
