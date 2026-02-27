-- CreateIndex
CREATE INDEX "seasons_cropId_idx" ON "seasons"("cropId");

-- CreateIndex
CREATE INDEX "seasons_seedVarietyId_idx" ON "seasons"("seedVarietyId");

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_seedVarietyId_fkey" FOREIGN KEY ("seedVarietyId") REFERENCES "seed_varieties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
