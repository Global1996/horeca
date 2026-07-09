import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Conectat ca {session.user?.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/stoc">Stoc</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/furnizori">Furnizori</Link>
        </Button>
        <Button asChild size="sm" variant="secondary">
          <Link href="/dashboard/angajati">Angajați</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bine ai venit</CardTitle>
          <CardDescription>
            Acesta este spațiul de lucru al contului tău de business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge>Activ</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
