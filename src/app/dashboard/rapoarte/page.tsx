import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BUSINESS_NAME = "Cafeneaua Test";

export default async function RapoartePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 sm:p-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          Rapoarte
        </h1>
        <p className="text-sm text-muted-foreground">{BUSINESS_NAME}</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Export Excel</CardTitle>
          <CardDescription>
            Fișierul conține două foi: stocul curent și istoricul mișcărilor
            de stoc. Intervalul de date de mai jos filtrează doar istoricul
            mișcărilor — dacă îl lași gol, se exportă tot istoricul.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/api/rapoarte/export"
            method="get"
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="from">
                  De la{" "}
                  <span className="font-normal text-muted-foreground">
                    (opțional)
                  </span>
                </Label>
                <Input id="from" name="from" type="date" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">
                  Până la{" "}
                  <span className="font-normal text-muted-foreground">
                    (opțional)
                  </span>
                </Label>
                <Input id="to" name="to" type="date" className="h-12" />
              </div>
            </div>
            <Button type="submit" size="lg" className="h-12 w-full text-base">
              Exportă Excel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
