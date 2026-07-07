import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCategory } from "@/lib/format";
import { saveStockCount } from "./actions";

const BUSINESS_NAME = "Cafeneaua Test";
const CATEGORY_ORDER = ["perisabil", "semi_perisabil", "non_perisabil"];

export default async function NumarareStocPage() {
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
      })
    : [];

  const knownGroups = CATEGORY_ORDER.map((category) => ({
    category,
    items: ingredients.filter((ingredient) => ingredient.category === category),
  })).filter((group) => group.items.length > 0);

  const otherItems = ingredients.filter(
    (ingredient) => !CATEGORY_ORDER.includes(ingredient.category)
  );
  const groups =
    otherItems.length > 0
      ? [...knownGroups, { category: otherItems[0].category, items: otherItems }]
      : knownGroups;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pb-24 sm:p-6">
      <div>
        <Link
          href="/dashboard/stoc"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Stoc
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Numărătoare stoc
        </h1>
        <p className="text-sm text-muted-foreground">{BUSINESS_NAME}</p>
      </div>

      <form action={saveStockCount} className="space-y-6">
        {groups.map((group) => (
          <Card key={group.category} className="overflow-hidden shadow-sm">
            <div className="border-b bg-paper px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {formatCategory(group.category)}
            </div>
            <CardContent className="divide-y divide-border p-0">
              {group.items.map((ingredient) => (
                <div key={ingredient.id} className="space-y-2 px-4 py-4">
                  <label
                    htmlFor={ingredient.id}
                    className="block text-base font-medium text-ink"
                  >
                    {ingredient.name}
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={ingredient.id}
                      name={ingredient.id}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      defaultValue={ingredient.currentStock}
                      className="h-14 flex-1 text-right font-mono text-lg tabular-nums"
                    />
                    <span className="w-12 shrink-0 text-sm text-muted-foreground">
                      {ingredient.usageUnit}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {ingredients.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Niciun ingredient găsit.
          </p>
        )}

        {ingredients.length > 0 && (
          <Button type="submit" size="lg" className="h-14 w-full text-base">
            Salvează numărătoarea
          </Button>
        )}
      </form>
    </div>
  );
}
