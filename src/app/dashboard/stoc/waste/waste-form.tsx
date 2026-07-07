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
import { Textarea } from "@/components/ui/textarea";

import { recordWaste } from "./actions";

type IngredientOption = {
  id: string;
  name: string;
  usageUnit: string;
};

const REASONS = [
  { value: "stricat", label: "Stricat" },
  { value: "aruncat", label: "Aruncat" },
  { value: "consum_personal", label: "Consum personal" },
  { value: "altul", label: "Altul" },
];

export function WasteForm({ ingredients }: { ingredients: IngredientOption[] }) {
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id ?? "");

  const selected = ingredients.find((ingredient) => ingredient.id === ingredientId);

  return (
    <form action={recordWaste} className="space-y-5">
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
          Cantitate {selected ? `(${selected.usageUnit})` : ""}
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
        <Label htmlFor="reason">Motiv</Label>
        <Select name="reason" defaultValue={REASONS[0].value}>
          <SelectTrigger id="reason" className="h-14 text-base">
            <SelectValue placeholder="Alege motivul" />
          </SelectTrigger>
          <SelectContent>
            {REASONS.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">
          Notă <span className="font-normal text-muted-foreground">(opțional)</span>
        </Label>
        <Textarea id="note" name="note" className="text-base" rows={3} />
      </div>

      <Button type="submit" size="lg" className="h-14 w-full text-base">
        Înregistrează pierderea
      </Button>
    </form>
  );
}
