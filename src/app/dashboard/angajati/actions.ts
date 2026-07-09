"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BUSINESS_NAME = "Cafeneaua Test";
const VALID_ROLES = ["barista", "bucatar", "ospatar", "manager"];

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

export async function createEmployee(formData: FormData) {
  await requireSession();

  const business = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });
  if (!business) return;

  const name = readOptionalString(formData.get("name"));
  const role = formData.get("role");
  if (!name || typeof role !== "string" || !VALID_ROLES.includes(role)) return;

  await prisma.employee.create({
    data: { businessId: business.id, name, role },
  });

  revalidatePath("/dashboard/angajati");
}

export async function updateEmployee(formData: FormData) {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const name = readOptionalString(formData.get("name"));
  const role = formData.get("role");
  if (!name || typeof role !== "string" || !VALID_ROLES.includes(role)) return;

  await prisma.employee.update({
    where: { id },
    data: { name, role },
  });

  revalidatePath("/dashboard/angajati");
}

export async function deleteEmployee(formData: FormData) {
  await requireSession();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await prisma.$transaction([
    prisma.shift.deleteMany({ where: { employeeId: id } }),
    prisma.employee.delete({ where: { id } }),
  ]);

  revalidatePath("/dashboard/angajati");
}

export async function toggleShift(formData: FormData) {
  await requireSession();

  const employeeId = formData.get("employeeId");
  if (typeof employeeId !== "string" || !employeeId) return;

  const activeShift = await prisma.shift.findFirst({
    where: { employeeId, endTime: null },
    orderBy: { startTime: "desc" },
  });

  if (activeShift) {
    await prisma.shift.update({
      where: { id: activeShift.id },
      data: { endTime: new Date() },
    });
  } else {
    await prisma.shift.create({
      data: { employeeId, startTime: new Date() },
    });
  }

  revalidatePath("/dashboard/angajati");
}
