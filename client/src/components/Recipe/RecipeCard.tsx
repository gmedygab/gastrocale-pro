import { Link } from "wouter";
import { Edit, FileText, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Recipe } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface RecipeCardProps {
  recipe: Recipe;
  onDelete: (id: number) => void;
  onGeneratePdf: (id: number) => void;
}

export default function RecipeCard({ recipe, onDelete, onGeneratePdf }: RecipeCardProps) {
  // Default image based on category
  const getDefaultImage = (category: string) => {
    switch (category) {
      case 'main':
        return "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
      case 'cocktail':
        return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
      case 'dessert':
        return "https://images.unsplash.com/photo-1469533778471-92a68acc3633?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
      case 'appetizer':
        return "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
      default:
        return "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      main: 'Main Dish',
      appetizer: 'Appetizer',
      dessert: 'Dessert',
      cocktail: 'Cocktail',
      beverage: 'Beverage',
      salad: 'Salad',
      sauce: 'Sauce',
      soup: 'Soup',
      side: 'Side Dish',
      breakfast: 'Breakfast',
    };
    
    return labels[category] || category;
  };

  const profitMargin = recipe.profitMargin 
    ? parseFloat(recipe.profitMargin as string) 
    : null;
    
  const costPerServing = recipe.costPerServing 
    ? parseFloat(recipe.costPerServing as string) 
    : null;

  return (
    <div className="recipe-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md">
      <div className="relative h-48 bg-neutral-100">
        <img 
          src={getDefaultImage(recipe.category)} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={18} className="text-neutral-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <a className="cursor-pointer">Edit Recipe</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/recipes/${recipe.id}`}>
                  <a className="cursor-pointer">View Details</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGeneratePdf(recipe.id)}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(recipe.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete Recipe
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-primary text-white text-xs rounded-md">
              {getCategoryLabel(recipe.category)}
            </span>
            {recipe.subcategory && (
              <span className="px-2 py-1 bg-secondary text-white text-xs rounded-md">
                {recipe.subcategory.charAt(0).toUpperCase() + recipe.subcategory.slice(1).replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-slab font-medium text-lg text-neutral-900 mb-1">
          <Link href={`/recipes/${recipe.id}`}>
            <a className="hover:text-primary transition-colors">{recipe.name}</a>
          </Link>
        </h3>
        <div className="flex items-center text-sm text-neutral-600 mb-3">
          <span className="mr-1 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.prepTime} mins
          </span>
          <span className="mx-2">•</span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-3">
          <div>
            <p className="text-xs text-neutral-500 uppercase font-medium">Cost per serving</p>
            <p className="text-lg font-medium text-neutral-900">
              {costPerServing !== null ? formatCurrency(costPerServing) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase font-medium">Profit margin</p>
            <p className={`text-lg font-medium ${profitMargin && profitMargin > 0 ? 'text-success' : 'text-neutral-900'}`}>
              {profitMargin !== null ? `${Math.round(profitMargin)}%` : '—'}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-100 flex">
          <Button 
            variant="ghost" 
            className="flex-1 text-primary hover:bg-primary/10 mr-2"
            asChild
          >
            <Link href={`/recipes/${recipe.id}/edit`}>
              <a className="flex items-center justify-center">
                <Edit size={16} className="mr-1" />
                Edit
              </a>
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 text-primary hover:bg-primary/10"
            onClick={() => onGeneratePdf(recipe.id)}
          >
            <FileText size={16} className="mr-1" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
