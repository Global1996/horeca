-- AlterTable
ALTER TABLE "businesses" RENAME CONSTRAINT "Business_pkey" TO "businesses_pkey";

-- AlterTable
ALTER TABLE "employees" RENAME CONSTRAINT "Employee_pkey" TO "employees_pkey";

-- AlterTable
ALTER TABLE "ingredients" RENAME CONSTRAINT "Ingredient_pkey" TO "ingredients_pkey";

-- AlterTable
ALTER TABLE "shifts" RENAME CONSTRAINT "Shift_pkey" TO "shifts_pkey";

-- AlterTable
ALTER TABLE "stock_movements" RENAME CONSTRAINT "StockMovement_pkey" TO "stock_movements_pkey";

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "supplierId" TEXT;

-- AlterTable
ALTER TABLE "suppliers" RENAME CONSTRAINT "Supplier_pkey" TO "suppliers_pkey";

-- CreateIndex
CREATE INDEX "stock_movements_supplierId_idx" ON "stock_movements"("supplierId");

-- RenameForeignKey
ALTER TABLE "employees" RENAME CONSTRAINT "Employee_businessId_fkey" TO "employees_businessId_fkey";

-- RenameForeignKey
ALTER TABLE "ingredients" RENAME CONSTRAINT "Ingredient_businessId_fkey" TO "ingredients_businessId_fkey";

-- RenameForeignKey
ALTER TABLE "ingredients" RENAME CONSTRAINT "Ingredient_supplierId_fkey" TO "ingredients_supplierId_fkey";

-- RenameForeignKey
ALTER TABLE "shifts" RENAME CONSTRAINT "Shift_employeeId_fkey" TO "shifts_employeeId_fkey";

-- RenameForeignKey
ALTER TABLE "stock_movements" RENAME CONSTRAINT "StockMovement_ingredientId_fkey" TO "stock_movements_ingredientId_fkey";

-- RenameForeignKey
ALTER TABLE "suppliers" RENAME CONSTRAINT "Supplier_businessId_fkey" TO "suppliers_businessId_fkey";

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Employee_businessId_idx" RENAME TO "employees_businessId_idx";

-- RenameIndex
ALTER INDEX "Ingredient_businessId_idx" RENAME TO "ingredients_businessId_idx";

-- RenameIndex
ALTER INDEX "Shift_employeeId_idx" RENAME TO "shifts_employeeId_idx";

-- RenameIndex
ALTER INDEX "StockMovement_createdAt_idx" RENAME TO "stock_movements_createdAt_idx";

-- RenameIndex
ALTER INDEX "StockMovement_ingredientId_idx" RENAME TO "stock_movements_ingredientId_idx";

-- RenameIndex
ALTER INDEX "Supplier_businessId_idx" RENAME TO "suppliers_businessId_idx";
