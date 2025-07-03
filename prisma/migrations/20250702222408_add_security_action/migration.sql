-- CreateTable
CREATE TABLE "SecurityAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecurityAction_userId_idx" ON "SecurityAction"("userId");

-- CreateIndex
CREATE INDEX "SecurityAction_deviceId_idx" ON "SecurityAction"("deviceId");
