import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  Users,
  Download,
  Tag,
  DollarSign,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useRecipe, useDeleteRecipe } from "@/lib/hooks/useRecipes";
import { formatCurrency, formatCategory, formatSubcategory } from "@/lib/utils";
import { generateRecipePDF } from "@/lib/utils/pdf";

interface RecipeDetailProps {
  id: number;
}

export default function RecipeDetail({ id }: RecipeDetailProps) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { data: recipe, isLoading, error } = useRecipe(id);
  const deleteRecipeMutation = useDeleteRecipe();

  const handleDelete = () => {
    deleteRecipeMutation.mutate(id, {
      onSuccess: () => {
        navigate("/recipes");
      }
    });
  };

  const handleExportPdf = async () => {
    if (!recipe) return;
    
    setIsGeneratingPdf(true);
    try {
      await generateRecipePDF(recipe);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Collect unique allergens
  const allergens = new Set<string>();
  recipe?.ingredients.forEach(ri => {
    if (ri.ingredient.allergens) {
      ri.ingredient.allergens.forEach(allergen => {
        if (allergen !== "none") {
          allergens.add(allergen);
        }
      });
    }
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-orange-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">Error Loading Recipe</h3>
        <p className="text-neutral-600 mb-6">Unable to load the recipe details.</p>
        <Button asChild>
          <Link href="/recipes">
            <a>Go Back to Recipes</a>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Back button and actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="mb-4 md:mb-0 w-fit"
          asChild
        >
          <Link href="/recipes">
            <a className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </a>
          </Link>
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleExportPdf}
            disabled={isGeneratingPdf || isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center"
            asChild
          >
            <Link href={`/recipes/${id}/edit`}>
              <a className="flex items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </a>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center text-destructive hover:bg-destructive/10"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Recipe Details */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <div className="flex flex-wrap gap-4 mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      ) : recipe ? (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-slab font-bold text-neutral-900 mb-4">{recipe.name}</h1>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-primary text-white">
                {formatCategory(recipe.category)}
              </Badge>
              
              {recipe.subcategory && (
                <Badge className="bg-secondary text-white">
                  {formatSubcategory(recipe.subcategory)}
                </Badge>
              )}
              
              <div className="flex items-center text-sm text-neutral-600">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.prepTime} mins
              </div>
              
              <div className="flex items-center text-sm text-neutral-600">
                <Users className="h-4 w-4 mr-1" />
                {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
              </div>
            </div>
            
            <Tabs defaultValue="ingredients" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="preparation">Preparation</TabsTrigger>
                <TabsTrigger value="costs">Costs & Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ingredients" className="p-1">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ingredient</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Unit Cost</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {recipe.ingredients.map((ri) => {
                        const totalCost = parseFloat(ri.quantity as string) * parseFloat(ri.ingredient.unitCost as string);
                        return (
                          <tr key={ri.id} className="hover:bg-neutral-50">
                            <td className="px-3 py-2 whitespace-nowrap font-medium">
                              {ri.ingredient.name}
                              {ri.ingredient.allergens && ri.ingredient.allergens.some(a => a !== "none") && (
                                <span className="ml-2 text-orange-500 text-xs" title={`Contains: ${ri.ingredient.allergens.filter(a => a !== "none").join(", ")}`}>
                                  <AlertTriangle className="h-3 w-3 inline" />
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              {ri.quantity} {ri.unit}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right">
                              {formatCurrency(parseFloat(ri.ingredient.unitCost as string))}/{ri.ingredient.unit}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                              {formatCurrency(totalCost)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-neutral-50 font-medium">
                        <td colSpan={3} className="px-3 py-2 text-right text-sm">Total Recipe Cost:</td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(parseFloat(recipe.totalCost as string || "0"))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {allergens.size > 0 && (
                  <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="font-medium">Allergens</span>
                    </div>
                    <p className="text-sm text-neutral-700">
                      Contains: {Array.from(allergens).join(", ")}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="preparation">
                <ol className="space-y-4 list-decimal pl-5">
                  {recipe.steps.map((step) => (
                    <li key={step.id} className="pl-2">
                      <div className="p-3 bg-white border border-neutral-200 rounded-md">
                        {step.description}
                      </div>
                    </li>
                  ))}
                </ol>
                
                {recipe.equipment && recipe.equipment.length > 0 && (
                  <div className="mt-6 p-4 bg-neutral-50 rounded-md">
                    <h3 className="font-medium mb-2">Required Equipment:</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.equipment.map((item, index) => (
                        <Badge key={index} variant="outline" className="bg-white">
                          {item.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="costs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Cost Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 border-b">
                        <span>Total Recipe Cost:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(recipe.totalCost as string || "0"))}</span>
                      </div>
                      <div className="flex justify-between p-2 border-b">
                        <span>Cost per Serving:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(recipe.costPerServing as string || "0"))}</span>
                      </div>
                      {recipe.sellingPrice && (
                        <div className="flex justify-between p-2 border-b">
                          <span>Selling Price:</span>
                          <span className="font-medium">{formatCurrency(parseFloat(recipe.sellingPrice as string))}</span>
                        </div>
                      )}
                      {recipe.profitMargin && (
                        <div className="flex justify-between p-2 border-b">
                          <span>Profit Margin:</span>
                          <span className="font-medium text-success">{Math.round(parseFloat(recipe.profitMargin as string))}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {recipe.notes && (
                      <>
                        <h3 className="font-medium mb-3">Recipe Notes</h3>
                        <div className="p-3 bg-neutral-50 rounded-md text-neutral-700 italic">
                          {recipe.notes}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  Cost Per Serving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(parseFloat(recipe.costPerServing as string || "0"))}
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Total cost: {formatCurrency(parseFloat(recipe.totalCost as string || "0"))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">
                  {recipe.profitMargin 
                    ? `${Math.round(parseFloat(recipe.profitMargin as string))}%` 
                    : "—"}
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Selling price: {recipe.sellingPrice 
                    ? formatCurrency(parseFloat(recipe.sellingPrice as string)) 
                    : "Not set"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {recipe.ingredients.length}
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  {recipe.steps.length} preparation steps
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center text-sm text-neutral-500 mt-8">
            <p>Created: {new Date(recipe.createdAt).toLocaleDateString()}</p>
            <p>Last Updated: {new Date(recipe.updatedAt).toLocaleDateString()}</p>
          </div>
        </>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the recipe
              and all its associated ingredients and steps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
