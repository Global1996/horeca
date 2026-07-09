import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatQuantity } from "@/lib/format";

const dateFormat = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const priceFormat = new Intl.NumberFormat("ro-RO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default async function SupplierDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
  });

  if (!supplier) {
    notFound();
  }

  const movements = await prisma.stockMovement.findMany({
    where: { supplierId: supplier.id, type: "achizitie" },
    include: {
      ingredient: {
        select: { name: true, purchaseUnit: true, conversionRate: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = movements.map((movement) => ({
    ...movement,
    quantityPurchaseUnit: movement.quantity / movement.ingredient.conversionRate,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/dashboard/furnizori"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Furnizori
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          {supplier.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {supplier.contact ?? "—"} · {supplier.phone ?? "—"}
        </p>
      </div>

      <div>
        <h2 className="mb-3 font-display text-xl font-semibold text-ink">
          Istoric prețuri
        </h2>

        {/* Sub 640px: carduri stivuite */}
        <div className="space-y-3 sm:hidden">
          {rows.map((movement) => (
            <Card key={movement.id} className="shadow-sm">
              <CardContent className="space-y-1 p-4">
                <p className="font-medium text-ink">
                  {movement.ingredient.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dateFormat.format(movement.createdAt)}
                </p>
                <div className="flex justify-between pt-1 text-sm">
                  <span className="font-mono tabular-nums">
                    {formatQuantity(
                      movement.quantityPurchaseUnit,
                      movement.ingredient.purchaseUnit
                    )}
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {movement.unitPrice != null
                      ? `${priceFormat.format(movement.unitPrice)} lei / ${movement.ingredient.purchaseUnit}`
                      : "—"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {rows.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Nicio achiziție înregistrată de la acest furnizor.
            </p>
          )}
        </div>

        {/* 640px+: tabel */}
        <div className="hidden rounded-xl border bg-card shadow-sm sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ingredient</TableHead>
                <TableHead className="text-right">Cantitate</TableHead>
                <TableHead className="text-right">Preț unitar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-mono tabular-nums">
                    {dateFormat.format(movement.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium text-ink">
                    {movement.ingredient.name}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatQuantity(
                      movement.quantityPurchaseUnit,
                      movement.ingredient.purchaseUnit
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {movement.unitPrice != null
                      ? `${priceFormat.format(movement.unitPrice)} lei / ${movement.ingredient.purchaseUnit}`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nicio achiziție înregistrată de la acest furnizor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
