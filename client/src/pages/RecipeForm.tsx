import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  PlusCircle, 
  Save, 
  ArrowLeft, 
  Trash2, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useToast } from "@/hooks/use-toast";
import IngredientRow from "@/components/Recipe/IngredientRow";
import StepRow from "@/components/Recipe/StepRow";
import { 
  useRecipe, 
  useCreateRecipe, 
  useUpdateRecipe,
  useAddIngredientToRecipe,
  useUpdateRecipeIngredient,
  useRemoveIngredientFromRecipe,
  useAddStepToRecipe,
  useUpdateStep,
  useDeleteStep
} from "@/lib/hooks/useRecipes";
import { useIngredients } from "@/lib/hooks/useIngredients";
import { 
  insertRecipeSchema, 
  equipmentOptions,
  categoryOptions,
  subcategoryOptions,
  Unit
} from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface RecipeFormProps {
  id?: number;
}

export default function RecipeForm({ id }: RecipeFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditMode = !!id;
  
  // State for ingredient rows
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([{ id: 'new-0', data: {} }]);
  const [nextIngredientId, setNextIngredientId] = useState(1);
  
  // State for step rows
  const [recipeSteps, setRecipeSteps] = useState<any[]>([{ id: 'new-0', data: {} }]);
  const [nextStepId, setNextStepId] = useState(1);
  
  // State for recipe cost calculations
  const [totalRecipeCost, setTotalRecipeCost] = useState(0);
  const [costPerServing, setCostPerServing] = useState(0);
  const [profitMargin, setProfitMargin] = useState<number | null>(null);
  
  // State for alert dialog
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // Get existing recipe data if in edit mode
  const { 
    data: existingRecipe, 
    isLoading: isLoadingRecipe,
    error: recipeError 
  } = useRecipe(id);
  
  // Get ingredients for dropdown
  const { 
    data: ingredients = [], 
    isLoading: isLoadingIngredients 
  } = useIngredients();
  
  // Mutations
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();
  const addIngredientMutation = useAddIngredientToRecipe();
  const updateIngredientMutation = useUpdateRecipeIngredient();
  const removeIngredientMutation = useRemoveIngredientFromRecipe();
  const addStepMutation = useAddStepToRecipe();
  const updateStepMutation = useUpdateStep();
  const deleteStepMutation = useDeleteStep();
  
  // Setup form with zod validation
  const formSchema = z.object({
    name: z.string().min(1, "Recipe name is required"),
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().optional(),
    servings: z.coerce.number().min(1, "Servings must be at least 1"),
    prepTime: z.coerce.number().min(1, "Preparation time must be at least 1 minute"),
    notes: z.string().optional(),
    equipment: z.array(z.string()).optional(),
    sellingPrice: z.string().optional()
      .refine(val => !val || !isNaN(parseFloat(val)), "Must be a valid number")
      .transform(val => val ? val : null),
  });
  
  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      subcategory: "",
      servings: 4,
      prepTime: 30,
      notes: "",
      equipment: [],
      sellingPrice: "",
    },
  });
  
  // Set form values when editing an existing recipe
  useEffect(() => {
    if (isEditMode && existingRecipe) {
      form.reset({
        name: existingRecipe.name,
        category: existingRecipe.category,
        subcategory: existingRecipe.subcategory || "",
        servings: existingRecipe.servings,
        prepTime: existingRecipe.prepTime,
        notes: existingRecipe.notes || "",
        equipment: existingRecipe.equipment || [],
        sellingPrice: existingRecipe.sellingPrice ? existingRecipe.sellingPrice.toString() : "",
      });
      
      // Set existing ingredients
      if (existingRecipe.ingredients && existingRecipe.ingredients.length > 0) {
        setRecipeIngredients(
          existingRecipe.ingredients.map(ri => ({
            id: ri.id,
            data: {
              id: ri.id,
              ingredientId: ri.ingredientId,
              quantity: ri.quantity.toString(),
              unit: ri.unit
            }
          }))
        );
      }
      
      // Set existing steps
      if (existingRecipe.steps && existingRecipe.steps.length > 0) {
        setRecipeSteps(
          existingRecipe.steps.map(step => ({
            id: step.id,
            data: {
              id: step.id,
              description: step.description
            }
          }))
        );
      }
      
      // Set cost calculations
      if (existingRecipe.totalCost) {
        setTotalRecipeCost(parseFloat(existingRecipe.totalCost as string));
      }
      
      if (existingRecipe.costPerServing) {
        setCostPerServing(parseFloat(existingRecipe.costPerServing as string));
      }
      
      if (existingRecipe.profitMargin) {
        setProfitMargin(parseFloat(existingRecipe.profitMargin as string));
      }
    }
  }, [existingRecipe, form, isEditMode]);
  
  // Update profit margin when selling price or cost per serving changes
  useEffect(() => {
    const sellingPrice = form.watch("sellingPrice");
    if (sellingPrice && costPerServing > 0) {
      const price = parseFloat(sellingPrice);
      if (!isNaN(price) && price > 0) {
        const margin = ((price - costPerServing) / price) * 100;
        setProfitMargin(margin);
      } else {
        setProfitMargin(null);
      }
    } else {
      setProfitMargin(null);
    }
  }, [form.watch("sellingPrice"), costPerServing]);
  
  // Handle adding a new ingredient row
  const handleAddIngredient = () => {
    setRecipeIngredients([
      ...recipeIngredients, 
      { id: `new-${nextIngredientId}`, data: {} }
    ]);
    setNextIngredientId(nextIngredientId + 1);
  };
  
  // Handle updating an ingredient row
  const handleUpdateIngredient = (index: number, data: any) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients[index].data = data;
    setRecipeIngredients(updatedIngredients);
    
    // Recalculate total cost
    calculateTotalCost(updatedIngredients);
  };
  
  // Handle removing an ingredient row
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients.splice(index, 1);
    setRecipeIngredients(updatedIngredients);
    
    // Recalculate total cost
    calculateTotalCost(updatedIngredients);
  };
  
  // Calculate total cost of recipe based on ingredients
  const calculateTotalCost = (ingredients: any[]) => {
    let total = 0;
    
    ingredients.forEach(ing => {
      if (ing.data.ingredientId && ing.data.quantity) {
        const selectedIngredient = ingredients.find(i => i.id === ing.data.ingredientId);
        if (selectedIngredient) {
          // Get unit cost of ingredient
          const unitCost = parseFloat(selectedIngredient.unitCost || "0");
          // Calculate cost for this ingredient
          const quantity = parseFloat(ing.data.quantity);
          if (!isNaN(unitCost) && !isNaN(quantity)) {
            total += unitCost * quantity;
          }
        }
      }
    });
    
    setTotalRecipeCost(total);
    
    // Calculate cost per serving
    const servings = form.watch("servings");
    if (servings > 0) {
      setCostPerServing(total / servings);
    }
  };
  
  // Handle adding a new step
  const handleAddStep = () => {
    setRecipeSteps([
      ...recipeSteps, 
      { id: `new-${nextStepId}`, data: {} }
    ]);
    setNextStepId(nextStepId + 1);
  };
  
  // Handle updating a step
  const handleUpdateStep = (index: number, data: any) => {
    const updatedSteps = [...recipeSteps];
    updatedSteps[index].data = data;
    setRecipeSteps(updatedSteps);
  };
  
  // Handle removing a step
  const handleRemoveStep = (index: number) => {
    const updatedSteps = [...recipeSteps];
    updatedSteps.splice(index, 1);
    setRecipeSteps(updatedSteps);
  };
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check if we have at least one ingredient and one step
    if (recipeIngredients.length === 0 || recipeIngredients.every(ing => !ing.data.ingredientId)) {
      toast({
        title: "Missing ingredients",
        description: "Please add at least one ingredient to your recipe.",
        variant: "destructive",
      });
      return;
    }
    
    if (recipeSteps.length === 0 || recipeSteps.every(step => !step.data.description)) {
      toast({
        title: "Missing steps",
        description: "Please add at least one preparation step to your recipe.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create or update recipe
      let recipeId = id;
      
      if (isEditMode) {
        // Update existing recipe
        await updateRecipeMutation.mutateAsync({
          id: recipeId!,
          recipe: values
        });
      } else {
        // Create new recipe
        const newRecipe = await createRecipeMutation.mutateAsync(values);
        recipeId = newRecipe.id;
      }
      
      // Process ingredients
      for (const ingredient of recipeIngredients) {
        const { id: ingId, data } = ingredient;
        
        // Skip ingredients without proper data
        if (!data.ingredientId || !data.quantity) continue;
        
        if (ingId.toString().startsWith('new-')) {
          // Add new ingredient to recipe
          await addIngredientMutation.mutateAsync({
            recipeId: recipeId!,
            ingredient: {
              ingredientId: data.ingredientId,
              quantity: data.quantity,
              unit: data.unit as Unit
            }
          });
        } else if (isEditMode) {
          // Update existing ingredient
          await updateIngredientMutation.mutateAsync({
            id: ingId,
            ingredient: {
              ingredientId: data.ingredientId,
              quantity: data.quantity,
              unit: data.unit as Unit
            }
          });
        }
      }
      
      // If editing, check for ingredients to remove
      if (isEditMode && existingRecipe) {
        const currentIngIds = recipeIngredients.map(ing => ing.id);
        const existingIngIds = existingRecipe.ingredients.map(ing => ing.id);
        
        // Find ingredients to remove (exist in DB but not in current form)
        const ingsToRemove = existingIngIds.filter(id => !currentIngIds.includes(id));
        
        for (const ingId of ingsToRemove) {
          await removeIngredientMutation.mutateAsync({
            id: ingId,
            recipeId: recipeId!
          });
        }
      }
      
      // Process steps
      for (let i = 0; i < recipeSteps.length; i++) {
        const { id: stepId, data } = recipeSteps[i];
        
        // Skip steps without description
        if (!data.description) continue;
        
        if (stepId.toString().startsWith('new-')) {
          // Add new step to recipe
          await addStepMutation.mutateAsync({
            recipeId: recipeId!,
            step: {
              stepNumber: i + 1,
              description: data.description
            }
          });
        } else if (isEditMode) {
          // Update existing step
          await updateStepMutation.mutateAsync({
            id: stepId,
            step: {
              stepNumber: i + 1,
              description: data.description
            }
          });
        }
      }
      
      // If editing, check for steps to remove
      if (isEditMode && existingRecipe) {
        const currentStepIds = recipeSteps.map(step => step.id);
        const existingStepIds = existingRecipe.steps.map(step => step.id);
        
        // Find steps to remove (exist in DB but not in current form)
        const stepsToRemove = existingStepIds.filter(id => !currentStepIds.includes(id));
        
        for (const stepId of stepsToRemove) {
          await deleteStepMutation.mutateAsync({
            id: stepId,
            recipeId: recipeId!
          });
        }
      }
      
      // Navigate to the recipe detail page
      toast({
        title: isEditMode ? "Recipe updated" : "Recipe created",
        description: isEditMode 
          ? "Your recipe has been updated successfully." 
          : "Your recipe has been created successfully.",
      });
      
      navigate(`/recipes/${recipeId}`);
    } catch (error) {
      console.error("Error saving recipe:", error);
      toast({
        title: "Error saving recipe",
        description: "An unexpected error occurred while saving your recipe.",
        variant: "destructive",
      });
    }
  };
  
  const isPending = 
    createRecipeMutation.isPending || 
    updateRecipeMutation.isPending ||
    addIngredientMutation.isPending ||
    updateIngredientMutation.isPending ||
    removeIngredientMutation.isPending ||
    addStepMutation.isPending ||
    updateStepMutation.isPending ||
    deleteStepMutation.isPending;
  
  // Format required equipment options for display
  const equipmentItems = equipmentOptions.map(item => ({
    id: item,
    label: item.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));
  
  // Format category options for display
  const formattedCategories = categoryOptions.map(cat => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));
  
  // Format subcategory options for display
  const formattedSubcategories = subcategoryOptions.map(subcat => ({
    id: subcat,
    label: subcat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }));
  
  // Handle cancel/go back
  const handleCancel = () => {
    if (form.formState.isDirty) {
      setIsAlertOpen(true);
    } else {
      navigateBack();
    }
  };
  
  const navigateBack = () => {
    if (isEditMode) {
      navigate(`/recipes/${id}`);
    } else {
      navigate("/recipes");
    }
  };

  if (recipeError) {
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
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="mb-4 md:mb-0 w-fit"
          onClick={handleCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isEditMode ? "Back to Recipe" : "Back to Recipes"}
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            className="flex items-center bg-primary text-white hover:bg-primary/90"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? "Update Recipe" : "Save Recipe"}
          </Button>
        </div>
      </div>

      {/* Recipe Form */}
      {isLoadingRecipe && isEditMode ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="h-10 w-2/3 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter recipe name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formattedCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {formattedSubcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Servings</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preparation Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Ingredients Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-900">Ingredients</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary hover:bg-primary/10"
                  onClick={handleAddIngredient}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Ingredient
                </Button>
              </div>
              
              {isLoadingIngredients ? (
                <div className="text-center py-4 text-neutral-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading ingredients...
                </div>
              ) : ingredients.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                  <p className="text-neutral-500 mb-4">
                    No ingredients available. Please add ingredients first.
                  </p>
                  <Button asChild>
                    <Link href="/ingredients">
                      <a>Manage Ingredients</a>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Ingredient
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Unit Cost (€)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Total Cost (€)
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Allergens
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {recipeIngredients.map((ingredient, index) => (
                          <IngredientRow
                            key={ingredient.id}
                            recipeIngredient={
                              isEditMode && existingRecipe?.ingredients.find(ri => ri.id === ingredient.id)
                            }
                            ingredients={ingredients}
                            onUpdate={(data) => handleUpdateIngredient(index, data)}
                            onDelete={() => handleRemoveIngredient(index)}
                            index={index}
                          />
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-neutral-100 font-medium">
                          <td colSpan={4} className="px-3 py-2 text-right text-sm text-neutral-700">
                            Total Recipe Cost:
                          </td>
                          <td className="px-3 py-2 text-left text-sm">
                            <div className="bg-white rounded border border-neutral-200 px-2 py-1 w-24 text-right font-bold">
                              {formatCurrency(totalRecipeCost)}
                            </div>
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                        <tr className="bg-neutral-100 font-medium">
                          <td colSpan={4} className="px-3 py-2 text-right text-sm text-neutral-700">
                            Cost per Serving:
                          </td>
                          <td className="px-3 py-2 text-left text-sm">
                            <div className="bg-white rounded border border-neutral-200 px-2 py-1 w-24 text-right font-bold">
                              {formatCurrency(costPerServing)}
                            </div>
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            {/* Preparation Steps Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-200">
                <h2 className="text-lg font-medium text-neutral-900">Preparation Steps</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary hover:bg-primary/10"
                  onClick={handleAddStep}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
              
              <div className="space-y-3">
                {recipeSteps.map((step, index) => (
                  <StepRow
                    key={step.id}
                    step={
                      isEditMode && existingRecipe?.steps.find(s => s.id === step.id)
                    }
                    number={index + 1}
                    onUpdate={(data) => handleUpdateStep(index, data)}
                    onDelete={() => handleRemoveStep(index)}
                  />
                ))}
              </div>
            </div>
            
            {/* Pricing Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Pricing Information
              </h2>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price per Serving (€)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" step="0.01" />
                        </FormControl>
                        <FormDescription>
                          Cost per serving: {formatCurrency(costPerServing)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700 mb-1">Profit Margin</p>
                    <div className="h-10 flex items-center">
                      <div className={`text-lg font-medium ${
                        profitMargin !== null 
                          ? profitMargin >= 0 
                            ? "text-success" 
                            : "text-destructive" 
                          : "text-neutral-500"
                      }`}>
                        {profitMargin !== null 
                          ? `${Math.round(profitMargin)}%` 
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Additional Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any special instructions or tips..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="equipment"
                  render={() => (
                    <FormItem>
                      <div className="mb-2">
                        <FormLabel>Required Equipment</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {equipmentItems.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="equipment"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Form Actions (Bottom) */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditMode ? "Update Recipe" : "Save Recipe"}
              </Button>
            </div>
          </form>
        </Form>
      )}
      
      {/* Unsaved Changes Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this page?
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction 
              onClick={navigateBack}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
