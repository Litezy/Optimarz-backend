-- CreateTable
CREATE TABLE "SiteVisit" (
    "id" SERIAL NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "path" TEXT,
    "visitDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteVisit_visitDate_idx" ON "SiteVisit"("visitDate");

-- CreateIndex
CREATE UNIQUE INDEX "SiteVisit_visitorHash_visitDate_key" ON "SiteVisit"("visitorHash", "visitDate");
