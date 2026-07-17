-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CLIENT';

-- AlterTable
ALTER TABLE "tkt_tickets" ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "subcategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "usr_users" ADD COLUMN     "clientId" TEXT;

-- CreateTable
CREATE TABLE "tkt_assignment_rules" (
    "id" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tkt_assignment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cat_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_subcategories" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cat_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tkt_assignment_rules_subcategoryId_key" ON "tkt_assignment_rules"("subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_categories_name_key" ON "cat_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cat_subcategories_categoryId_name_key" ON "cat_subcategories"("categoryId", "name");

-- CreateIndex
CREATE INDEX "tkt_tickets_categoryId_idx" ON "tkt_tickets"("categoryId");

-- CreateIndex
CREATE INDEX "tkt_tickets_subcategoryId_idx" ON "tkt_tickets"("subcategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "usr_users_clientId_key" ON "usr_users"("clientId");

-- AddForeignKey
ALTER TABLE "tkt_assignment_rules" ADD CONSTRAINT "tkt_assignment_rules_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "cat_subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_assignment_rules" ADD CONSTRAINT "tkt_assignment_rules_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_subcategories" ADD CONSTRAINT "cat_subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "cat_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_tickets" ADD CONSTRAINT "tkt_tickets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "cat_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_tickets" ADD CONSTRAINT "tkt_tickets_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "cat_subcategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usr_users" ADD CONSTRAINT "usr_users_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "cli_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

