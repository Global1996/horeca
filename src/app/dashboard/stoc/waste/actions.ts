"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const REASON_LABELS: Record<string, string> = {
  stricat: "Stricat",
  aruncat: "Aruncat",
  consum_personal: "Consum personal",
  altul: "Altul",
};

export async function recordWaste(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const ingredientId = formData.get("ingredientId");
  const quantityRaw = formData.get("quantity");
  const reasonRaw = formData.get("reason");
  const noteRaw = formData.get("note");

  if (typeof ingredientId !== "string" || !ingredientId) {
    redirect("/dashboard/stoc/waste");
  }

  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
  });

  if (!ingredient) {
    redirect("/dashboard/stoc/waste");
  }

  const quantity = Number(quantityRaw);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    redirect("/dashboard/stoc/waste");
  }

  const reasonLabel =
    typeof reasonRaw === "string" && REASON_LABELS[reasonRaw]
      ? REASON_LABELS[reasonRaw]
      : REASON_LABELS.altul;
  const note = typeof noteRaw === "string" ? noteRaw.trim() : "";
  const fullNote = note ? `${reasonLabel}: ${note}` : reasonLabel;

  const newStock = ingredient.currentStock - quantity;
  const wasClamped = newStock < 0;
  const finalStock = wasClamped ? 0 : newStock;

  const createdBy = session.user.name ?? session.user.email ?? undefined;

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        ingredientId: ingredient.id,
        type: "waste",
        quantity,
        note: fullNote,
        createdBy,
      },
    }),
    prisma.ingredient.update({
      where: { id: ingredient.id },
      data: { currentStock: finalStock },
    }),
  ]);

  const params = new URLSearchParams({ success: "waste" });
  if (wasClamped) {
    params.set("clamped", ingredient.name);
  }

  redirect(`/dashboard/stoc?${params.toString()}`);
}
