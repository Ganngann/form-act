-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Formation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "durationType" TEXT NOT NULL DEFAULT 'HALF_DAY',
    "programLink" TEXT,
    "price" DECIMAL,
    "methodology" TEXT,
    "inclusions" TEXT,
    "agreementCode" TEXT,
    "imageUrl" TEXT,
    "expertiseId" TEXT,
    "categoryId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Formation_expertiseId_fkey" FOREIGN KEY ("expertiseId") REFERENCES "Expertise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Formation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Formation" ("agreementCode", "categoryId", "description", "duration", "durationType", "expertiseId", "id", "imageUrl", "inclusions", "level", "methodology", "price", "programLink", "title") SELECT "agreementCode", "categoryId", "description", "duration", "durationType", "expertiseId", "id", "imageUrl", "inclusions", "level", "methodology", "price", "programLink", "title" FROM "Formation";
DROP TABLE "Formation";
ALTER TABLE "new_Formation" RENAME TO "Formation";
CREATE UNIQUE INDEX "Formation_title_key" ON "Formation"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
