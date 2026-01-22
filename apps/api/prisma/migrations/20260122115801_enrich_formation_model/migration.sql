-- AlterTable
ALTER TABLE "Formateur" ADD COLUMN "calendarToken" TEXT;

-- AlterTable
ALTER TABLE "Formation" ADD COLUMN "agreementCode" TEXT;
ALTER TABLE "Formation" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Formation" ADD COLUMN "inclusions" TEXT;
ALTER TABLE "Formation" ADD COLUMN "methodology" TEXT;
ALTER TABLE "Formation" ADD COLUMN "price" DECIMAL;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vatNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("address", "companyName", "id", "userId", "vatNumber") SELECT "address", "companyName", "id", "userId", "vatNumber" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_vatNumber_key" ON "Client"("vatNumber");
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
