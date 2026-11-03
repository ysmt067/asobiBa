-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "isStartPlayer" BOOLEAN NOT NULL,
    "isDraw" BOOLEAN NOT NULL,
    "fanCount" INTEGER NOT NULL,
    "symbolCount" INTEGER,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT NOT NULL,
    "fanCount" INTEGER NOT NULL,
    "fanCountForCall" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hand_pkey" PRIMARY KEY ("id")
);
