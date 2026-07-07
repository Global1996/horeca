import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusStamp, type StockStatus } from "@/components/status-stamp";
import { formatCategory, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/utils";

const BUSINESS_NAME = "Cafeneaua Test";

function getStockStatus(currentStock: number, minThreshold: number): StockStatus {
  if (currentStock <= minThreshold) return "rosu";
  if (currentStock <= minThreshold * 1.3) return "galben";
  return "verde";
}

const statusOrder: Record<StockStatus, number> = {
  rosu: 0,
  galben: 1,
  verde: 2,
};

const successMessages: Record<string, string> = {
  numarare: "Numărătoare salvată cu succes",
  achizitie: "Achiziție înregistrată cu succes",
  waste: "Pierdere înregistrată cu succes",
};

export default async function StocPage({
  searchParams,
}: {
  searchParams: { success?: string; clamped?: string };
}) {
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
        include: { supplier: true },
      })
    : [];

  const rows = ingredients
    .map((ingredient) => ({
      ...ingredient,
      status: getStockStatus(ingredient.currentStock, ingredient.minThreshold),
    }))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const belowThresholdCount = rows.filter((row) => row.status === "rosu").length;
  const successMessage = searchParams.success
    ? successMessages[searchParams.success]
    : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Stoc
        </h1>
        <p className="text-sm text-muted-foreground">{BUSINESS_NAME}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/dashboard/stoc/numarare">Numără stoc</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/stoc/achizitie">Adaugă achiziție</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/stoc/waste">Înregistrează pierdere</Link>
        </Button>
      </div>

      {successMessage && (
        <Card className="border-olive/30 bg-olive/10 shadow-sm">
          <CardContent className="pt-6">
            <p className="font-medium text-olive">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {searchParams.clamped && (
        <Card className="border-gold/40 bg-gold/15 shadow-sm">
          <CardContent className="pt-6">
            <p className="font-medium text-ink">
              Stocul pentru „{searchParams.clamped}” a fost plafonat la 0
              (cantitatea de pierdere depășea stocul curent).
            </p>
          </CardContent>
        </Card>
      )}

      {belowThresholdCount > 0 && (
        <Card className="border-danger/30 bg-danger/10 shadow-sm">
          <CardContent className="pt-6">
            <p className="font-medium text-danger">
              {belowThresholdCount} ingrediente sub prag minim
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sub 640px: carduri stivuite */}
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <Card key={row.id} className="shadow-sm">
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-ink">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCategory(row.category)}
                </p>
                <div className="pt-1 text-sm">
                  <p className="font-mono tabular-nums">
                    Stoc: {formatQuantity(row.currentStock, row.usageUnit)}
                  </p>
                  <p className="font-mono tabular-nums text-muted-foreground">
                    Prag min: {formatQuantity(row.minThreshold, row.usageUnit)}
                  </p>
                </div>
              </div>
              <StatusStamp status={row.status} />
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Niciun ingredient găsit.
          </p>
        )}
      </div>

      {/* 640px+: tabel */}
      <div className="hidden rounded-xl border bg-card shadow-sm sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nume</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead className="text-right">Stoc curent</TableHead>
              <TableHead className="text-right">Prag minim</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-ink">
                  {row.name}
                </TableCell>
                <TableCell>{formatCategory(row.category)}</TableCell>
                <TableCell
                  className={cn("text-right font-mono tabular-nums")}
                >
                  {formatQuantity(row.currentStock, row.usageUnit)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                  {formatQuantity(row.minThreshold, row.usageUnit)}
                </TableCell>
                <TableCell>
                  <StatusStamp status={row.status} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Niciun ingredient găsit.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
