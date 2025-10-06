/*
  Warnings:

  - Added the required column `vaccineCatalogId` to the `Vaccine` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vaccine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "petId" INTEGER NOT NULL,
    "vaccineCatalogId" INTEGER NOT NULL,
    CONSTRAINT "Vaccine_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vaccine_vaccineCatalogId_fkey" FOREIGN KEY ("vaccineCatalogId") REFERENCES "VaccineCatalog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vaccine" ("date", "id", "name", "petId") SELECT "date", "id", "name", "petId" FROM "Vaccine";
DROP TABLE "Vaccine";
ALTER TABLE "new_Vaccine" RENAME TO "Vaccine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
