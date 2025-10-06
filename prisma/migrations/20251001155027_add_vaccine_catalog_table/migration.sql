-- CreateTable
CREATE TABLE "VaccineCatalog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "descricao" TEXT,
    "faixaEtaria" TEXT,
    "dose" TEXT
);
