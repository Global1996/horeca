"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createSupplier, updateSupplier } from "./actions";

type SupplierData = {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
};

export function SupplierFormDialog({
  mode,
  supplier,
  trigger,
}: {
  mode: "create" | "edit";
  supplier?: SupplierData;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    if (mode === "edit" && supplier) {
      formData.set("id", supplier.id);
    }

    try {
      if (mode === "edit") {
        await updateSupplier(formData);
      } else {
        await createSupplier(formData);
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">
            {mode === "edit" ? "Editează furnizor" : "Adaugă furnizor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={supplier?.name}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">
              Contact{" "}
              <span className="font-normal text-muted-foreground">
                (opțional)
              </span>
            </Label>
            <Input
              id="contact"
              name="contact"
              defaultValue={supplier?.contact ?? ""}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon{" "}
              <span className="font-normal text-muted-foreground">
                (opțional)
              </span>
            </Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={supplier?.phone ?? ""}
              className="h-12"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
