-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "usr_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usr_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cli_clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cli_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tkt_tickets" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "tkt_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tkt_comments" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tkt_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tkt_assignment_history" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "previousUserId" TEXT,
    "newUserId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tkt_assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tkt_status_history" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "previousStatus" "TicketStatus",
    "newStatus" "TicketStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tkt_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usr_users_email_key" ON "usr_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cli_clients_email_key" ON "cli_clients"("email");

-- CreateIndex
CREATE INDEX "tkt_tickets_clientId_idx" ON "tkt_tickets"("clientId");

-- CreateIndex
CREATE INDEX "tkt_tickets_assignedToId_idx" ON "tkt_tickets"("assignedToId");

-- CreateIndex
CREATE INDEX "tkt_tickets_status_idx" ON "tkt_tickets"("status");

-- CreateIndex
CREATE INDEX "tkt_tickets_priority_idx" ON "tkt_tickets"("priority");

-- CreateIndex
CREATE INDEX "tkt_tickets_updatedAt_idx" ON "tkt_tickets"("updatedAt");

-- CreateIndex
CREATE INDEX "tkt_comments_ticketId_idx" ON "tkt_comments"("ticketId");

-- CreateIndex
CREATE INDEX "tkt_assignment_history_ticketId_idx" ON "tkt_assignment_history"("ticketId");

-- CreateIndex
CREATE INDEX "tkt_status_history_ticketId_idx" ON "tkt_status_history"("ticketId");

-- AddForeignKey
ALTER TABLE "tkt_tickets" ADD CONSTRAINT "tkt_tickets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "cli_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_tickets" ADD CONSTRAINT "tkt_tickets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_tickets" ADD CONSTRAINT "tkt_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "usr_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_comments" ADD CONSTRAINT "tkt_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tkt_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_comments" ADD CONSTRAINT "tkt_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_assignment_history" ADD CONSTRAINT "tkt_assignment_history_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tkt_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_assignment_history" ADD CONSTRAINT "tkt_assignment_history_previousUserId_fkey" FOREIGN KEY ("previousUserId") REFERENCES "usr_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_assignment_history" ADD CONSTRAINT "tkt_assignment_history_newUserId_fkey" FOREIGN KEY ("newUserId") REFERENCES "usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_assignment_history" ADD CONSTRAINT "tkt_assignment_history_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_status_history" ADD CONSTRAINT "tkt_status_history_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tkt_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tkt_status_history" ADD CONSTRAINT "tkt_status_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
