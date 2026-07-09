import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import ExcelJS from "exceljs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCategory } from "@/lib/format";
import { getStockStatus, stockStatusLabels } from "@/lib/stock-status";
import { autoSizeColumns, styleHeaderRow } from "@/lib/excel";

const BUSINESS_NAME = "Cafeneaua Test";

// Trebuie ținute manual în sincron cu --color-paper / --color-ink din globals.css
const HEADER_BG_HEX = "#F3E9D8";
const HEADER_TEXT_HEX = "#2B1D14";

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  achizitie: "Achiziție",
  waste: "Pierdere",
  numarare: "Numărătoare",
};

function parseDateParam(value: string | null, endOfDay = false) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return date;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const from = parseDateParam(fromParam);
  const to = parseDateParam(toParam, true);

  const business = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const [ingredients, movements] = await Promise.all([
    prisma.ingredient.findMany({
      where: { businessId: business.id },
      orderBy: { name: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: {
        ingredient: { businessId: business.id },
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lte: to } : {}),
              },
            }
          : {}),
      },
      include: {
        ingredient: { select: { name: true, usageUnit: true, vatRate: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Horeca";
  workbook.created = new Date();

  const stockSheet = workbook.addWorksheet("Stoc curent");
  stockSheet.columns = [
    { header: "Nume", key: "name" },
    { header: "Categorie", key: "category" },
    { header: "Stoc curent", key: "currentStock" },
    { header: "U.M.", key: "unit" },
    { header: "Prag minim", key: "minThreshold" },
    { header: "Status", key: "status" },
  ];

  ingredients.forEach((ingredient) => {
    const status = getStockStatus(ingredient.currentStock, ingredient.minThreshold);
    stockSheet.addRow({
      name: ingredient.name,
      category: formatCategory(ingredient.category),
      currentStock: ingredient.currentStock,
      unit: ingredient.usageUnit,
      minThreshold: ingredient.minThreshold,
      status: stockStatusLabels[status],
    });
  });

  styleHeaderRow(stockSheet, HEADER_BG_HEX, HEADER_TEXT_HEX);
  autoSizeColumns(stockSheet);

  const movementsSheet = workbook.addWorksheet("Istoric mișcări");
  movementsSheet.columns = [
    { header: "Data", key: "date" },
    { header: "Tip", key: "type" },
    { header: "Ingredient", key: "ingredient" },
    { header: "Cantitate", key: "quantity" },
    { header: "U.M.", key: "unit" },
    { header: "Cota TVA", key: "vatRate" },
    { header: "Preț unitar", key: "unitPrice" },
    { header: "Valoare totală", key: "totalValue" },
    { header: "Furnizor", key: "supplier" },
    { header: "Notă", key: "note" },
    { header: "Creat de", key: "createdBy" },
  ];

  movements.forEach((movement) => {
    const totalValue =
      movement.unitPrice != null ? movement.quantity * movement.unitPrice : null;

    movementsSheet.addRow({
      date: movement.createdAt,
      type: MOVEMENT_TYPE_LABELS[movement.type] ?? movement.type,
      ingredient: movement.ingredient.name,
      quantity: movement.quantity,
      unit: movement.ingredient.usageUnit,
      vatRate: `${movement.ingredient.vatRate}%`,
      unitPrice: movement.unitPrice,
      totalValue,
      supplier: movement.supplier?.name ?? "",
      note: movement.note ?? "",
      createdBy: movement.createdBy ?? "",
    });
  });

  const achizitieTotal = movements
    .filter((movement) => movement.type === "achizitie" && movement.unitPrice != null)
    .reduce((sum, movement) => sum + movement.quantity * movement.unitPrice!, 0);

  const totalRow = movementsSheet.addRow({
    date: "Total achiziții perioada",
    totalValue: achizitieTotal,
  });
  totalRow.font = { bold: true };

  movementsSheet.getColumn("date").numFmt = "dd.mm.yyyy hh:mm";
  movementsSheet.getColumn("unitPrice").numFmt = "0.00";
  movementsSheet.getColumn("totalValue").numFmt = "0.00";

  styleHeaderRow(movementsSheet, HEADER_BG_HEX, HEADER_TEXT_HEX);
  autoSizeColumns(movementsSheet);

  const buffer = await workbook.xlsx.writeBuffer();

  const filenameParts = ["raport-cafeneaua-test"];
  if (fromParam) filenameParts.push(`de-la-${fromParam}`);
  if (toParam) filenameParts.push(`pana-la-${toParam}`);
  const filename = `${filenameParts.join("_")}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
