/*
  Warnings:

  - The primary key for the `Pokemon` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `gameIds` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the `SyncInfo` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `id` on the `Pokemon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Pokemon" DROP CONSTRAINT "Pokemon_pkey",
DROP COLUMN "gameIds",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ALTER COLUMN "stats" DROP NOT NULL,
ALTER COLUMN "sprites" DROP NOT NULL,
ADD CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "SyncInfo";

-- CreateTable
CREATE TABLE "PokemonType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PokemonType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "games" TEXT[],
    "range" INTEGER[],

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PokemonType_name_key" ON "PokemonType"("name");

-- CreateIndex
CREATE INDEX "Pokemon_name_idx" ON "Pokemon"("name");

-- CreateIndex
CREATE INDEX "Pokemon_generationId_idx" ON "Pokemon"("generationId");

-- CreateIndex
CREATE INDEX "Pokemon_types_idx" ON "Pokemon"("types");
