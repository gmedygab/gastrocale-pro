import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Recipe, 
  FullRecipe, 
  InsertRecipe, 
  RecipeFilter, 
  InsertRecipeIngredient, 
  InsertStep,
  RecipeIngredient,
  Step
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useRecipes(filter?: RecipeFilter) {
  // Build query string from filter
  let queryString = "";
  if (filter) {
    const params = new URLSearchParams();
    if (filter.search) params.append("search", filter.search);
    if (filter.category) params.append("category", filter.category);
    if (filter.subcategory) params.append("subcategory", filter.subcategory);
    if (filter.sortBy) params.append("sortBy", filter.sortBy);
    queryString = params.toString() ? `?${params.toString()}` : "";
  }
  
  return useQuery({
    queryKey: ['/api/recipes', queryString],
    queryFn: async () => {
      const res = await fetch(`/api/recipes${queryString}`);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      return res.json() as Promise<Recipe[]>;
    }
  });
}

export function useRecipe(id?: number) {
  return useQuery({
    queryKey: ['/api/recipes', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/recipes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch recipe");
      return res.json() as Promise<FullRecipe>;
    },
    enabled: !!id
  });
}

export function useCreateRecipe() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (recipe: InsertRecipe) => {
      const res = await apiRequest("POST", "/api/recipes", recipe);
      return res.json() as Promise<Recipe>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Recipe created",
        description: "Your recipe has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating recipe",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateRecipe() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, recipe }: { id: number; recipe: Partial<InsertRecipe> }) => {
      const res = await apiRequest("PATCH", `/api/recipes/${id}`, recipe);
      return res.json() as Promise<Recipe>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', variables.id] });
      toast({
        title: "Recipe updated",
        description: "Your recipe has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating recipe",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteRecipe() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/recipes/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Recipe deleted",
        description: "Your recipe has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting recipe",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useAddIngredientToRecipe() {
  return useMutation({
    mutationFn: async ({ recipeId, ingredient }: { recipeId: number; ingredient: Omit<InsertRecipeIngredient, "recipeId"> }) => {
      const res = await apiRequest("POST", `/api/recipes/${recipeId}/ingredients`, ingredient);
      return res.json() as Promise<{ recipeIngredient: RecipeIngredient; recipeCosts: any }>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', variables.recipeId] });
    }
  });
}

export function useUpdateRecipeIngredient() {
  return useMutation({
    mutationFn: async ({ id, ingredient }: { id: number; ingredient: Partial<InsertRecipeIngredient> }) => {
      const res = await apiRequest("PATCH", `/api/recipe-ingredients/${id}`, ingredient);
      return res.json() as Promise<{ recipeIngredient: RecipeIngredient; recipeCosts: any }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', data.recipeIngredient.recipeId] });
    }
  });
}

export function useRemoveIngredientFromRecipe() {
  return useMutation({
    mutationFn: async ({ id, recipeId }: { id: number; recipeId: number }) => {
      const res = await apiRequest("DELETE", `/api/recipe-ingredients/${id}`);
      return { ...(await res.json()), recipeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', data.recipeId] });
    }
  });
}

export function useAddStepToRecipe() {
  return useMutation({
    mutationFn: async ({ recipeId, step }: { recipeId: number; step: Omit<InsertStep, "recipeId"> }) => {
      const res = await apiRequest("POST", `/api/recipes/${recipeId}/steps`, step);
      return res.json() as Promise<Step>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', variables.recipeId] });
    }
  });
}

export function useUpdateStep() {
  return useMutation({
    mutationFn: async ({ id, step }: { id: number; step: Partial<InsertStep> }) => {
      const res = await apiRequest("PATCH", `/api/steps/${id}`, step);
      return res.json() as Promise<Step>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', data.recipeId] });
    }
  });
}

export function useDeleteStep() {
  return useMutation({
    mutationFn: async ({ id, recipeId }: { id: number; recipeId: number }) => {
      await apiRequest("DELETE", `/api/steps/${id}`);
      return { id, recipeId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipes', data.recipeId] });
    }
  });
}
