import { Link } from "wouter";
import { PlusCircle, Utensils, CookingPot, GlassWater, HandPlatter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecipes } from "@/lib/hooks/useRecipes";
import { useIngredients } from "@/lib/hooks/useIngredients";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { data: recipes = [], isLoading: isLoadingRecipes } = useRecipes();
  const { data: ingredients = [], isLoading: isLoadingIngredients } = useIngredients();

  // Calculate dashboard stats
  const recipeCount = recipes.length;
  const ingredientCount = ingredients.length;
  
  // Recipe categories count
  const categories = recipes.reduce((acc, recipe) => {
    const category = recipe.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Most profitable recipes
  const profitableRecipes = [...recipes]
    .filter(r => r.profitMargin !== null)
    .sort((a, b) => {
      const marginA = a.profitMargin ? parseFloat(a.profitMargin as string) : 0;
      const marginB = b.profitMargin ? parseFloat(b.profitMargin as string) : 0;
      return marginB - marginA;
    })
    .slice(0, 5);
  
  // Latest recipes
  const latestRecipes = [...recipes]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-slab font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Welcome to GastroCalc Pro. Manage your recipes and calculate food costs.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href="/recipes/new">
              <div className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Recipe
              </div>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-neutral-700">Total Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{recipeCount}</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Utensils className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/recipes">
              <div className="text-sm text-primary hover:underline cursor-pointer">View all recipes</div>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-neutral-700">Main Dishes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{categories.main || 0}</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CookingPot className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/recipes?category=main">
              <div className="text-sm text-primary hover:underline cursor-pointer">View main dishes</div>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-neutral-700">Cocktails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{categories.cocktail || 0}</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <GlassWater className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/recipes?category=cocktail">
              <div className="text-sm text-primary hover:underline cursor-pointer">View cocktails</div>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-neutral-700">Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{ingredientCount}</div>
              <div className="p-2 bg-primary/10 rounded-full">
                <HandPlatter className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/ingredients">
              <div className="text-sm text-primary hover:underline cursor-pointer">Manage ingredients</div>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Profitable Recipes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Most Profitable Recipes</CardTitle>
            <CardDescription>Recipes with highest profit margins</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecipes ? (
              <div className="text-center py-4 text-neutral-500">Loading...</div>
            ) : profitableRecipes.length > 0 ? (
              <div className="space-y-4">
                {profitableRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-neutral-50"
                  >
                    <div>
                      <Link href={`/recipes/${recipe.id}`}>
                        <a className="font-medium hover:text-primary">{recipe.name}</a>
                      </Link>
                      <div className="text-sm text-neutral-500">{recipe.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-success font-medium">
                        {recipe.profitMargin ? Math.round(parseFloat(recipe.profitMargin as string)) : 0}%
                      </div>
                      <div className="text-sm text-neutral-500">
                        {recipe.costPerServing ? formatCurrency(parseFloat(recipe.costPerServing as string)) : "—"}/serving
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">No profitable recipes yet</div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/recipes">
                <a>View All Recipes</a>
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Recipes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recently Added Recipes</CardTitle>
            <CardDescription>Your latest creations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecipes ? (
              <div className="text-center py-4 text-neutral-500">Loading...</div>
            ) : latestRecipes.length > 0 ? (
              <div className="space-y-4">
                {latestRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-neutral-50"
                  >
                    <div>
                      <Link href={`/recipes/${recipe.id}`}>
                        <a className="font-medium hover:text-primary">{recipe.name}</a>
                      </Link>
                      <div className="text-sm text-neutral-500">{recipe.category}</div>
                    </div>
                    <div className="text-sm text-neutral-500">
                      {new Date(recipe.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">No recipes yet</div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/recipes/new">
                <a>Create New Recipe</a>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
