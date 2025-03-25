-- CreateTable
CREATE TABLE "Pokemon" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "types" TEXT[],
    "abilities" TEXT[],
    "baseExperience" INTEGER,
    "generationId" INTEGER NOT NULL,
    "gameIds" TEXT[],
    "stats" JSONB NOT NULL,
    "sprites" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncInfo" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "version" TEXT NOT NULL,
    "pokemonCount" INTEGER NOT NULL,

    CONSTRAINT "SyncInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_name_key" ON "Pokemon"("name");
