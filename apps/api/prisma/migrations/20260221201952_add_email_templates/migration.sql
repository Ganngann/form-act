-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATETIME NOT NULL,
    "slot" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "trainerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "price" DECIMAL,
    "clientId" TEXT,
    "location" TEXT,
    "logistics" TEXT,
    "isLogisticsOpen" BOOLEAN NOT NULL DEFAULT false,
    "participants" TEXT,
    "proofUrl" TEXT,
    "billedAt" DATETIME,
    "billingData" TEXT,
    CONSTRAINT "Session_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Formateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("billedAt", "billingData", "clientId", "createdAt", "date", "formationId", "id", "isLogisticsOpen", "location", "logistics", "participants", "proofUrl", "slot", "status", "trainerId") SELECT "billedAt", "billingData", "clientId", "createdAt", "date", "formationId", "id", "isLogisticsOpen", "location", "logistics", "participants", "proofUrl", "slot", "status", "trainerId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_type_key" ON "EmailTemplate"("type");
