-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Formateur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "userId" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "calendarToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Formateur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Formateur" ("address", "avatarUrl", "bio", "calendarToken", "email", "firstName", "id", "lastName", "userId") SELECT "address", "avatarUrl", "bio", "calendarToken", "email", "firstName", "id", "lastName", "userId" FROM "Formateur";
DROP TABLE "Formateur";
ALTER TABLE "new_Formateur" RENAME TO "Formateur";
CREATE UNIQUE INDEX "Formateur_email_key" ON "Formateur"("email");
CREATE UNIQUE INDEX "Formateur_userId_key" ON "Formateur"("userId");
CREATE UNIQUE INDEX "Formateur_calendarToken_key" ON "Formateur"("calendarToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
