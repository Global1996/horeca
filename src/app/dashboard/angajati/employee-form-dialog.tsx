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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createEmployee, updateEmployee } from "./actions";

const ROLES = [
  { value: "barista", label: "Barista" },
  { value: "bucatar", label: "Bucătar" },
  { value: "ospatar", label: "Ospătar" },
  { value: "manager", label: "Manager" },
];

type EmployeeData = {
  id: string;
  name: string;
  role: string;
};

export function EmployeeFormDialog({
  mode,
  employee,
  trigger,
}: {
  mode: "create" | "edit";
  employee?: EmployeeData;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState(employee?.role ?? ROLES[0].value);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    if (mode === "edit" && employee) {
      formData.set("id", employee.id);
    }

    try {
      if (mode === "edit") {
        await updateEmployee(formData);
      } else {
        await createEmployee(formData);
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
            {mode === "edit" ? "Editează angajat" : "Adaugă angajat"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nume</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={employee?.name}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select name="role" value={role} onValueChange={setRole}>
              <SelectTrigger id="role" className="h-12 text-base">
                <SelectValue placeholder="Alege rolul" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
