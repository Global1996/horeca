"use client";

import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { deleteSupplier } from "./actions";
import { SupplierFormDialog } from "./supplier-form-dialog";

type SupplierData = {
  id: string;
  name: string;
  contact: string | null;
  phone: string | null;
};

export function SupplierRowActions({ supplier }: { supplier: SupplierData }) {
  const router = useRouter();

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", supplier.id);
    await deleteSupplier(formData);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <SupplierFormDialog
        mode="edit"
        supplier={supplier}
        trigger={
          <Button size="sm" variant="outline">
            Editează
          </Button>
        }
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline">
            Șterge
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Ștergi „{supplier.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Ingredientele care aveau
              acest furnizor implicit vor rămâne fără furnizor asociat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
