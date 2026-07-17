-- CreateTable
CREATE TABLE "aut_refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aut_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aut_refresh_tokens_userId_idx" ON "aut_refresh_tokens"("userId");

-- AddForeignKey
ALTER TABLE "aut_refresh_tokens" ADD CONSTRAINT "aut_refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usr_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
