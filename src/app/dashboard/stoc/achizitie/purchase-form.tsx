"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createPurchase } from "./actions";

type IngredientOption = {
  id: string;
  name: string;
  category: string;
  purchaseUnit: string;
  usageUnit: string;
};

type SupplierOption = {
  id: string;
  name: string;
};

const PERISHABLE_CATEGORIES = ["perisabil", "semi_perisabil"];

export function PurchaseForm({
  ingredients,
  suppliers,
}: {
  ingredients: IngredientOption[];
  suppliers: SupplierOption[];
}) {
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id ?? "");

  const selected = ingredients.find((ingredient) => ingredient.id === ingredientId);
  const showExpiration = selected
    ? PERISHABLE_CATEGORIES.includes(selected.category)
    : false;

  return (
    <form action={createPurchase} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="ingredientId">Ingredient</Label>
        <Select
          name="ingredientId"
          value={ingredientId}
          onValueChange={setIngredientId}
        >
          <SelectTrigger id="ingredientId" className="h-14 text-base">
            <SelectValue placeholder="Alege ingredient" />
          </SelectTrigger>
          <SelectContent>
            {ingredients.map((ingredient) => (
              <SelectItem key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">
          Cantitate {selected ? `(${selected.purchaseUnit})` : ""}
        </Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          inputMode="decimal"
          step="any"
          min="0.01"
          required
          className="h-14 text-right font-mono text-lg tabular-nums"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="unitPrice">
          Preț unitar {selected ? `(lei / ${selected.purchaseUnit})` : ""}{" "}
          <span className="font-normal text-muted-foreground">(opțional)</span>
        </Label>
        <Input
          id="unitPrice"
          name="unitPrice"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          className="h-14 text-right font-mono text-lg tabular-nums"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplierId">
          Furnizor{" "}
          <span className="font-normal text-muted-foreground">(opțional)</span>
        </Label>
        <Select name="supplierId" defaultValue="none">
          <SelectTrigger id="supplierId" className="h-14 text-base">
            <SelectValue placeholder="Fără furnizor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Fără furnizor</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showExpiration && (
        <div className="space-y-2">
          <Label htmlFor="expirationDate">
            Data expirării{" "}
            <span className="font-normal text-muted-foreground">
              (opțional)
            </span>
          </Label>
          <Input
            id="expirationDate"
            name="expirationDate"
            type="date"
            className="h-14 text-base"
          />
        </div>
      )}

      <Button type="submit" size="lg" className="h-14 w-full text-base">
        Adaugă achiziția
      </Button>
    </form>
  );
}
