import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WasteForm } from "./waste-form";

const BUSINESS_NAME = "Cafeneaua Test";

export default async function WastePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const business = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });

  const ingredients = business
    ? await prisma.ingredient.findMany({
        where: { businessId: business.id },
        orderBy: { name: "asc" },
        select: { id: true, name: true, usageUnit: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/dashboard/stoc"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Stoc
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Înregistrează pierdere
        </h1>
        <p className="text-sm text-muted-foreground">{BUSINESS_NAME}</p>
      </div>

      {ingredients.length > 0 ? (
        <WasteForm ingredients={ingredients} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Niciun ingredient găsit.
        </p>
      )}
    </div>
  );
}
