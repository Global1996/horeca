"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BUSINESS_NAME = "Cafeneaua Test";

export async function saveStockCount(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const business = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });

  if (!business) {
    redirect("/dashboard/stoc");
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { businessId: business.id },
  });

  const createdBy = session.user.name ?? session.user.email ?? undefined;

  const operations = [];

  for (const ingredient of ingredients) {
    const raw = formData.get(ingredient.id);
    if (raw === null) continue;

    const newValue = Number(raw);
    if (!Number.isFinite(newValue) || newValue < 0) continue;
    if (newValue === ingredient.currentStock) continue;

    operations.push(
      prisma.stockMovement.create({
        data: {
          ingredientId: ingredient.id,
          type: "numarare",
          quantity: newValue,
          createdBy,
        },
      }),
      prisma.ingredient.update({
        where: { id: ingredient.id },
        data: { currentStock: newValue },
      })
    );
  }

  if (operations.length > 0) {
    await prisma.$transaction(operations);
  }

  redirect("/dashboard/stoc?success=numarare");
}
