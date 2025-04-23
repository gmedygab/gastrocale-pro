import { useState, useEffect } from "react";
import { Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ingredient, RecipeIngredient, Unit, unitOptions } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface IngredientRowProps {
  recipeIngredient?: RecipeIngredient & { ingredient: Ingredient };
  ingredients: Ingredient[];
  onUpdate: (data: { 
    id?: number; 
    ingredientId: number; 
    quantity: string;
    unit: Unit;
  }) => void;
  onDelete: () => void;
  index: number;
}

export default function IngredientRow({ 
  recipeIngredient,
  ingredients, 
  onUpdate, 
  onDelete,
  index
}: IngredientRowProps) {
  const [ingredientId, setIngredientId] = useState<number>(
    recipeIngredient?.ingredientId || 0
  );
  
  const [quantity, setQuantity] = useState<string>(
    recipeIngredient?.quantity?.toString() || "0"
  );
  
  const [unit, setUnit] = useState<Unit>(
    (recipeIngredient?.unit as Unit) || "g"
  );
  
  const [totalCost, setTotalCost] = useState<number>(0);
  
  // Find the selected ingredient from the ingredients list
  const selectedIngredient = ingredients.find(ing => ing.id === ingredientId);
  
  // Calculate total cost whenever quantity or ingredient changes
  useEffect(() => {
    if (selectedIngredient && quantity) {
      const cost = parseFloat(selectedIngredient.unitCost as string) * parseFloat(quantity);
      setTotalCost(cost);
    } else {
      setTotalCost(0);
    }
  }, [selectedIngredient, quantity]);
  
  // Trigger update when any value changes
  useEffect(() => {
    if (ingredientId) {
      onUpdate({
        id: recipeIngredient?.id,
        ingredientId,
        quantity,
        unit
      });
    }
  }, [ingredientId, quantity, unit, onUpdate, recipeIngredient?.id]);

  // Get allergens for tooltip
  const getAllergenText = () => {
    if (!selectedIngredient || !selectedIngredient.allergens || selectedIngredient.allergens.length === 0) {
      return "No allergens";
    }
    
    if (selectedIngredient.allergens.includes("none")) {
      return "No allergens";
    }
    
    return `Contains: ${selectedIngredient.allergens.join(", ")}`;
  };

  return (
    <tr className="recipe-ingredient hover:bg-neutral-50">
      <td className="px-3 py-2 whitespace-nowrap">
        <Select 
          value={ingredientId.toString()} 
          onValueChange={(value) => setIngredientId(parseInt(value, 10))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select ingredient..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Select ingredient...</SelectItem>
            {ingredients.map((ingredient) => (
              <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                {ingredient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="0"
          step="0.01"
          className="w-20"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <Select value={unit} onValueChange={(value) => setUnit(value as Unit)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <Input
          type="text"
          value={selectedIngredient ? selectedIngredient.unitCost as string : "0"}
          disabled
          className="w-20 bg-neutral-50"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap font-medium">
        <div className="bg-neutral-50 rounded px-2 py-1 w-20 text-right">
          {formatCurrency(totalCost)}
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center">
        {selectedIngredient && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info size={16} className="text-neutral-500 hover:text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getAllergenText()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8"
        >
          <Trash2 size={16} className="text-neutral-500 hover:text-destructive" />
        </Button>
      </td>
    </tr>
  );
}
