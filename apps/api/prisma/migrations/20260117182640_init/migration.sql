-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Formateur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT
);

-- CreateTable
CREATE TABLE "Expertise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Formation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "expertiseId" TEXT,
    CONSTRAINT "Formation_expertiseId_fkey" FOREIGN KEY ("expertiseId") REFERENCES "Expertise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_Predilection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Predilection_A_fkey" FOREIGN KEY ("A") REFERENCES "Formateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Predilection_B_fkey" FOREIGN KEY ("B") REFERENCES "Zone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_Expertise" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Expertise_A_fkey" FOREIGN KEY ("A") REFERENCES "Formateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Expertise_B_fkey" FOREIGN KEY ("B") REFERENCES "Zone" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ExpertiseToFormateur" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ExpertiseToFormateur_A_fkey" FOREIGN KEY ("A") REFERENCES "Expertise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ExpertiseToFormateur_B_fkey" FOREIGN KEY ("B") REFERENCES "Formateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Formateur_email_key" ON "Formateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_name_key" ON "Zone"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_code_key" ON "Zone"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Expertise_name_key" ON "Expertise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_Predilection_AB_unique" ON "_Predilection"("A", "B");

-- CreateIndex
CREATE INDEX "_Predilection_B_index" ON "_Predilection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Expertise_AB_unique" ON "_Expertise"("A", "B");

-- CreateIndex
CREATE INDEX "_Expertise_B_index" ON "_Expertise"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ExpertiseToFormateur_AB_unique" ON "_ExpertiseToFormateur"("A", "B");

-- CreateIndex
CREATE INDEX "_ExpertiseToFormateur_B_index" ON "_ExpertiseToFormateur"("B");
