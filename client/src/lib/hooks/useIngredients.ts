import { useQuery, useMutation } from "@tanstack/react-query";
import { Ingredient, InsertIngredient } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useIngredients() {
  return useQuery({
    queryKey: ['/api/ingredients'],
    queryFn: async () => {
      const res = await fetch('/api/ingredients');
      if (!res.ok) throw new Error("Failed to fetch ingredients");
      return res.json() as Promise<Ingredient[]>;
    }
  });
}

export function useIngredient(id?: number) {
  return useQuery({
    queryKey: ['/api/ingredients', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/ingredients/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ingredient");
      return res.json() as Promise<Ingredient>;
    },
    enabled: !!id
  });
}

export function useCreateIngredient() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (ingredient: InsertIngredient) => {
      const res = await apiRequest("POST", "/api/ingredients", ingredient);
      return res.json() as Promise<Ingredient>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      toast({
        title: "Ingredient created",
        description: "Your ingredient has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating ingredient",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateIngredient() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ingredient }: { id: number; ingredient: Partial<InsertIngredient> }) => {
      const res = await apiRequest("PATCH", `/api/ingredients/${id}`, ingredient);
      return res.json() as Promise<Ingredient>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients', variables.id] });
      toast({
        title: "Ingredient updated",
        description: "Your ingredient has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating ingredient",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeleteIngredient() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ingredients/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ingredients'] });
      toast({
        title: "Ingredient deleted",
        description: "Your ingredient has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting ingredient",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
