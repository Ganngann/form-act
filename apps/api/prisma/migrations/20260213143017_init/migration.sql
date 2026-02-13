-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "resetToken" TEXT,
    "resetTokenExpires" DATETIME
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vatNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "auditLog" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Formateur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "userId" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "calendarToken" TEXT,
    CONSTRAINT "Formateur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT
);

-- CreateTable
CREATE TABLE "Category" (
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

-- CreateTable
CREATE TABLE "Session" (
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
    "billingData" TEXT,
    CONSTRAINT "Session_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "Formation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Formateur" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    "metadata" TEXT
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
CREATE TABLE "_AuthorizedTrainers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AuthorizedTrainers_A_fkey" FOREIGN KEY ("A") REFERENCES "Formateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AuthorizedTrainers_B_fkey" FOREIGN KEY ("B") REFERENCES "Formation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_vatNumber_key" ON "Client"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Formateur_email_key" ON "Formateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Formateur_userId_key" ON "Formateur"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Formateur_calendarToken_key" ON "Formateur"("calendarToken");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_name_key" ON "Zone"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_code_key" ON "Zone"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Formation_title_key" ON "Formation"("title");

-- CreateIndex
CREATE UNIQUE INDEX "_Predilection_AB_unique" ON "_Predilection"("A", "B");

-- CreateIndex
CREATE INDEX "_Predilection_B_index" ON "_Predilection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Expertise_AB_unique" ON "_Expertise"("A", "B");

-- CreateIndex
CREATE INDEX "_Expertise_B_index" ON "_Expertise"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorizedTrainers_AB_unique" ON "_AuthorizedTrainers"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorizedTrainers_B_index" ON "_AuthorizedTrainers"("B");
