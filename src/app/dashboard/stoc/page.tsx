import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const BUSINESS_NAME = "Cafeneaua Test";

type StockStatus = "rosu" | "galben" | "verde";

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

const numberFormat = new Intl.NumberFormat("ro-RO");

function formatQuantity(value: number, unit: string) {
  return `${numberFormat.format(value)} ${unit}`;
}

function formatCategory(category: string) {
  const withSpaces = category.replace(/_/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

export default async function StocPage() {
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Stoc</h1>
        <p className="text-sm text-muted-foreground">{BUSINESS_NAME}</p>
      </div>

      {belowThresholdCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="font-medium text-destructive">
              {belowThresholdCount} ingrediente sub prag minim
            </p>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nume</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead>Stoc curent</TableHead>
              <TableHead>Prag minim</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{formatCategory(row.category)}</TableCell>
                <TableCell>
                  {formatQuantity(row.currentStock, row.usageUnit)}
                </TableCell>
                <TableCell>
                  {formatQuantity(row.minThreshold, row.usageUnit)}
                </TableCell>
                <TableCell>
                  {row.status === "rosu" && (
                    <Badge variant="destructive">Sub prag</Badge>
                  )}
                  {row.status === "galben" && (
                    <Badge className="border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80">
                      Aproape de prag
                    </Badge>
                  )}
                  {row.status === "verde" && (
                    <Badge className="border-transparent bg-green-600 text-white hover:bg-green-600/80">
                      OK
                    </Badge>
                  )}
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
