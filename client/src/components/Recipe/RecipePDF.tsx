import { FullRecipe } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

// React component for generating PDF (this will be used by the PDF generation utility)
export default function RecipePDF({ recipe }: { recipe: FullRecipe }) {
  // Format allergens
  const allergens = new Set<string>();
  recipe.ingredients.forEach(ri => {
    if (ri.ingredient.allergens) {
      ri.ingredient.allergens.forEach(allergen => {
        if (allergen !== "none") {
          allergens.add(allergen);
        }
      });
    }
  });

  const allergensList = Array.from(allergens);

  return (
    <div className="p-8 bg-white max-w-[800px] mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-600">
          <span>Servings: {recipe.servings}</span>
          <span>•</span>
          <span>Prep Time: {recipe.prepTime} mins</span>
          {recipe.category && (
            <>
              <span>•</span>
              <span>Category: {recipe.category}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ri) => (
              <li key={ri.id} className="flex justify-between">
                <span>
                  {ri.quantity} {ri.unit} {ri.ingredient.name}
                </span>
                <span className="text-neutral-500">
                  {formatCurrency(parseFloat(ri.quantity as string) * parseFloat(ri.ingredient.unitCost as string))}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">Nutrition & Cost</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Total Cost:</span>
              <span>{formatCurrency(parseFloat(recipe.totalCost as string || "0"))}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Cost per Serving:</span>
              <span>{formatCurrency(parseFloat(recipe.costPerServing as string || "0"))}</span>
            </div>
            {recipe.sellingPrice && (
              <div className="flex justify-between">
                <span className="font-medium">Selling Price:</span>
                <span>{formatCurrency(parseFloat(recipe.sellingPrice as string))}</span>
              </div>
            )}
            {recipe.profitMargin && (
              <div className="flex justify-between">
                <span className="font-medium">Profit Margin:</span>
                <span>{Math.round(parseFloat(recipe.profitMargin as string))}%</span>
              </div>
            )}
          </div>

          {allergensList.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Allergens:</h3>
              <div className="text-sm bg-neutral-100 p-2 rounded">
                {allergensList.join(", ")}
              </div>
            </div>
          )}

          {recipe.equipment && recipe.equipment.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Equipment:</h3>
              <ul className="list-disc pl-5 text-sm">
                {recipe.equipment.map((eq, i) => (
                  <li key={i}>{eq.replace('_', ' ')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b">Preparation</h2>
        <ol className="space-y-4 list-decimal pl-5">
          {recipe.steps.map((step) => (
            <li key={step.id} className="pl-2">
              {step.description}
            </li>
          ))}
        </ol>
      </div>

      {recipe.notes && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b">Notes</h2>
          <div className="bg-neutral-50 p-4 rounded-lg text-neutral-700 italic">
            {recipe.notes}
          </div>
        </div>
      )}

      <div className="text-center text-sm text-neutral-500 mt-12 pt-4 border-t">
        <p>Generated with GastroCalc Pro • {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
