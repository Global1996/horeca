"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createPurchase(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const ingredientId = formData.get("ingredientId");
  const quantityRaw = formData.get("quantity");
  const unitPriceRaw = formData.get("unitPrice");
  const supplierIdRaw = formData.get("supplierId");
  const expirationDateRaw = formData.get("expirationDate");

  if (typeof ingredientId !== "string" || !ingredientId) {
    redirect("/dashboard/stoc/achizitie");
  }

  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  });

  if (!ingredient) {
    redirect("/dashboard/stoc/achizitie");
  }

  const quantityPurchaseUnit = Number(quantityRaw);
  if (!Number.isFinite(quantityPurchaseUnit) || quantityPurchaseUnit <= 0) {
    redirect("/dashboard/stoc/achizitie");
  }

  const quantityUsageUnit = quantityPurchaseUnit * ingredient.conversionRate;

  const unitPrice =
    typeof unitPriceRaw === "string" && unitPriceRaw.trim() !== ""
      ? Number(unitPriceRaw)
      : null;

  const supplierId =
    typeof supplierIdRaw === "string" &&
    supplierIdRaw !== "none" &&
    supplierIdRaw !== ""
      ? supplierIdRaw
      : null;

  const expirationDate =
    typeof expirationDateRaw === "string" && expirationDateRaw !== ""
      ? new Date(expirationDateRaw)
      : null;

  const createdBy = session.user.name ?? session.user.email ?? undefined;

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        ingredientId: ingredient.id,
        type: "achizitie",
        quantity: quantityUsageUnit,
        unitPrice,
        expirationDate,
        supplierId,
        createdBy,
      },
    }),
    prisma.ingredient.update({
      where: { id: ingredient.id },
      data: { currentStock: { increment: quantityUsageUnit } },
    }),
  ]);

  redirect("/dashboard/stoc?success=achizitie");
}
