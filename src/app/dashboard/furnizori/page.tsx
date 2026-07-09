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
import { SupplierFormDialog } from "./supplier-form-dialog";
import { SupplierRowActions } from "./supplier-row-actions";

const BUSINESS_NAME = "Cafeneaua Test";

export default async function FurnizoriPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const business = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });

  const suppliers = business
    ? await prisma.supplier.findMany({
        where: { businessId: business.id },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            Furnizori
          </h1>
          <p className="text-sm text-muted-foreground">{BUSINESS_NAME}</p>
        </div>
        <SupplierFormDialog
          mode="create"
          trigger={
            <Button size="sm" className="mt-1 shrink-0">
              Adaugă furnizor
            </Button>
          }
        />
      </div>

      {/* Sub 640px: carduri stivuite */}
      <div className="space-y-3 sm:hidden">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="shadow-sm">
            <CardContent className="space-y-3 p-4">
              <Link
                href={`/dashboard/furnizori/${supplier.id}`}
                className="block font-medium text-ink hover:underline"
              >
                {supplier.name}
              </Link>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{supplier.contact ?? "—"}</p>
                <p>{supplier.phone ?? "—"}</p>
              </div>
              <SupplierRowActions supplier={supplier} />
            </CardContent>
          </Card>
        ))}
        {suppliers.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Niciun furnizor găsit.
          </p>
        )}
      </div>

      {/* 640px+: tabel */}
      <div className="hidden rounded-xl border bg-card shadow-sm sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nume</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-right">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/furnizori/${supplier.id}`}
                    className="text-ink hover:underline"
                  >
                    {supplier.name}
                  </Link>
                </TableCell>
                <TableCell>{supplier.contact ?? "—"}</TableCell>
                <TableCell>{supplier.phone ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <SupplierRowActions supplier={supplier} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Niciun furnizor găsit.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
