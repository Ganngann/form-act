/*
  Warnings:

  - You are about to drop the `Expertise` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ExpertiseToFormateur` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `expertiseId` on the `Formation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Expertise_name_key";

-- DropIndex
DROP INDEX "_ExpertiseToFormateur_B_index";

-- DropIndex
DROP INDEX "_ExpertiseToFormateur_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Expertise";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ExpertiseToFormateur";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_AuthorizedTrainers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AuthorizedTrainers_A_fkey" FOREIGN KEY ("A") REFERENCES "Formateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AuthorizedTrainers_B_fkey" FOREIGN KEY ("B") REFERENCES "Formation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "agreementCodes" TEXT,
    "imageUrl" TEXT,
    "isExpertise" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Formation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Formation" ("agreementCodes", "categoryId", "description", "duration", "durationType", "id", "imageUrl", "inclusions", "isPublished", "level", "methodology", "price", "programLink", "title") SELECT "agreementCodes", "categoryId", "description", "duration", "durationType", "id", "imageUrl", "inclusions", "isPublished", "level", "methodology", "price", "programLink", "title" FROM "Formation";
DROP TABLE "Formation";
ALTER TABLE "new_Formation" RENAME TO "Formation";
CREATE UNIQUE INDEX "Formation_title_key" ON "Formation"("title");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorizedTrainers_AB_unique" ON "_AuthorizedTrainers"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorizedTrainers_B_index" ON "_AuthorizedTrainers"("B");
