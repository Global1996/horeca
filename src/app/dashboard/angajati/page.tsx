import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { EmployeeRowActions } from "./employee-row-actions";
import { toggleShift } from "./actions";

const BUSINESS_NAME = "Cafeneaua Test";

const ROLE_LABELS: Record<string, string> = {
  barista: "Barista",
  bucatar: "Bucătar",
  ospatar: "Ospătar",
  manager: "Manager",
};

const shiftDateFormat = new Intl.DateTimeFormat("ro-RO", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AngajatiPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const business = await prisma.business.findFirst({
    where: { name: BUSINESS_NAME },
  });

  const employees = business
    ? await prisma.employee.findMany({
        where: { businessId: business.id },
        orderBy: { name: "asc" },
        include: {
          shifts: {
            orderBy: { startTime: "desc" },
            take: 5,
          },
        },
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
            Angajați
          </h1>
          <p className="text-sm text-muted-foreground">{BUSINESS_NAME}</p>
        </div>
        <EmployeeFormDialog
          mode="create"
          trigger={
            <Button size="sm" className="mt-1 shrink-0">
              Adaugă angajat
            </Button>
          }
        />
      </div>

      <div className="space-y-3">
        {employees.map((employee) => {
          const activeShift =
            employee.shifts[0]?.endTime === null
              ? employee.shifts[0]
              : undefined;

          return (
            <Card key={employee.id} className="shadow-sm">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_LABELS[employee.role] ?? employee.role}
                    </p>
                  </div>
                  <EmployeeRowActions employee={employee} />
                </div>

                <form action={toggleShift}>
                  <input type="hidden" name="employeeId" value={employee.id} />
                  <Button
                    type="submit"
                    size="sm"
                    variant={activeShift ? "secondary" : "outline"}
                  >
                    {activeShift ? "Încheie tura" : "Start tură"}
                  </Button>
                </form>

                <div className="space-y-1 border-t pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ultimele ture
                  </p>
                  {employee.shifts.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nicio tură înregistrată.
                    </p>
                  )}
                  {employee.shifts.map((shift) => (
                    <p
                      key={shift.id}
                      className="font-mono text-sm tabular-nums text-muted-foreground"
                    >
                      {shiftDateFormat.format(shift.startTime)} –{" "}
                      {shift.endTime
                        ? shiftDateFormat.format(shift.endTime)
                        : "în curs"}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {employees.length === 0 && (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Niciun angajat găsit.
          </p>
        )}
      </div>
    </div>
  );
}
