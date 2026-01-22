-- AlterTable
ALTER TABLE "Client" ADD COLUMN "auditLog" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpires" DATETIME;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATETIME NOT NULL,
    "slot" TEXT NOT NULL,
    "formationId" TEXT NOT NULL,
    "trainerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clientId" TEXT,
    "location" TEXT,
    "logistics" TEXT,
    "isLogisticsOpen" BOOLEAN NOT NULL DEFAULT false,
    "participants" TEXT,
    "proofUrl" TEXT,
    "billedAt" DATETIME,
    CONSTRAINT "Session_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Formateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("billedAt", "clientId", "createdAt", "date", "formationId", "id", "location", "logistics", "participants", "proofUrl", "slot", "status", "trainerId") SELECT "billedAt", "clientId", "createdAt", "date", "formationId", "id", "location", "logistics", "participants", "proofUrl", "slot", "status", "trainerId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
