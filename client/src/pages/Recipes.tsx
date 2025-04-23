import { useState } from "react";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import RecipeCard from "@/components/Recipe/RecipeCard";
import RecipeFilter from "@/components/Recipe/RecipeFilter";
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
import { useRecipes, useDeleteRecipe } from "@/lib/hooks/useRecipes";
import { RecipeFilter as RecipeFilterType } from "@shared/schema";
import { generateRecipePDF } from "@/lib/utils/pdf";

export default function Recipes() {
  const [filter, setFilter] = useState<RecipeFilterType>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const { data: recipes = [], isLoading } = useRecipes(filter);
  const deleteRecipeMutation = useDeleteRecipe();

  const handleFilterChange = (newFilter: RecipeFilterType) => {
    setFilter(newFilter);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteRecipeMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleGeneratePdf = async (id: number) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // Fetch the full recipe with ingredients and steps
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) throw new Error('Failed to fetch recipe details');
      
      const fullRecipe = await response.json();
      
      // Generate and download the PDF
      await generateRecipePDF(fullRecipe);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-slab font-bold text-neutral-900">Recipes</h1>
          <p className="text-neutral-600 mt-1">
            Manage and calculate costs for your culinary creations
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href="/recipes/new">
              <a className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Recipe
              </a>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <RecipeFilter onFilterChange={handleFilterChange} />

      {/* Recipe Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="h-48" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-2 gap-4 pt-3">
                  <div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                  <div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
          <div className="mb-4">
            <PlusCircle className="h-12 w-12 mx-auto text-neutral-300" />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">No recipes found</h3>
          <p className="text-neutral-500 mb-6">
            {Object.keys(filter).length > 0
              ? "Try changing your search criteria or clearing filters"
              : "Get started by creating your first recipe"}
          </p>
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href="/recipes/new">
              <a>Create New Recipe</a>
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={handleDelete}
              onGeneratePdf={handleGeneratePdf}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the recipe and all its ingredients and steps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
