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

import { deleteEmployee } from "./actions";
import { EmployeeFormDialog } from "./employee-form-dialog";

type EmployeeData = {
  id: string;
  name: string;
  role: string;
};

export function EmployeeRowActions({ employee }: { employee: EmployeeData }) {
  const router = useRouter();

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", employee.id);
    await deleteEmployee(formData);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 gap-2">
      <EmployeeFormDialog
        mode="edit"
        employee={employee}
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
              Ștergi „{employee.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Istoricul turelor acestui
              angajat va fi șters odată cu el.
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
