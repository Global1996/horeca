"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BUSINESS_NAME = "Cafeneaua Test";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  return session;
}

function readOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function createSupplier(formData: FormData) {
  await requireSession();

  const business = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });
  if (!business) return;

  const name = readOptionalString(formData.get("name"));
  if (!name) return;

  await prisma.supplier.create({
    data: {
      businessId: business.id,
      name,
      contact: readOptionalString(formData.get("contact")),
      phone: readOptionalString(formData.get("phone")),
    },
  });

  revalidatePath("/dashboard/furnizori");
}

export async function updateSupplier(formData: FormData) {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const name = readOptionalString(formData.get("name"));
  if (!name) return;

  await prisma.supplier.update({
    where: { id },
    data: {
      name,
      contact: readOptionalString(formData.get("contact")),
      phone: readOptionalString(formData.get("phone")),
    },
  });

  revalidatePath("/dashboard/furnizori");
  revalidatePath(`/dashboard/furnizori/${id}`);
}

export async function deleteSupplier(formData: FormData) {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await prisma.supplier.delete({ where: { id } });

  revalidatePath("/dashboard/furnizori");
}
