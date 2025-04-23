import { useState } from "react";
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  useIngredients, 
  useCreateIngredient, 
  useUpdateIngredient,
  useDeleteIngredient
} from "@/lib/hooks/useIngredients";
import { insertIngredientSchema, allergenOptions, unitOptions, Ingredient } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { z } from "zod";

export default function Ingredients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Get ingredients data
  const { data: ingredients = [], isLoading } = useIngredients();
  
  // Mutations
  const createIngredient = useCreateIngredient();
  const updateIngredient = useUpdateIngredient();
  const deleteIngredient = useDeleteIngredient();
  
  // Create form with zod validation
  const formSchema = z.object({
    name: z.string().min(1, "Ingredient name is required"),
    unitCost: z.string()
      .min(1, "Unit cost is required")
      .refine(val => !isNaN(parseFloat(val)), "Must be a valid number"),
    unit: z.string().min(1, "Unit is required"),
    allergens: z.array(z.string()).optional(),
    supplier: z.string().optional(),
    notes: z.string().optional(),
  });
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unitCost: "",
      unit: "g",
      allergens: ["none"],
      supplier: "",
      notes: "",
    },
  });
  
  // Filter ingredients based on search term
  const filteredIngredients = ingredients.filter(ingredient => 
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ingredient.supplier && ingredient.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Open form dialog to create a new ingredient
  const handleAddNew = () => {
    setSelectedIngredient(null);
    setFormMode("create");
    form.reset({
      name: "",
      unitCost: "",
      unit: "g",
      allergens: ["none"],
      supplier: "",
      notes: "",
    });
    setIsFormOpen(true);
  };
  
  // Open form dialog to edit an existing ingredient
  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setFormMode("edit");
    form.reset({
      name: ingredient.name,
      unitCost: ingredient.unitCost as string,
      unit: ingredient.unit,
      allergens: ingredient.allergens || ["none"],
      supplier: ingredient.supplier || "",
      notes: ingredient.notes || "",
    });
    setIsFormOpen(true);
  };
  
  // Open confirm dialog to delete an ingredient
  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };
  
  // Handle delete confirmation
  const confirmDelete = () => {
    if (deleteId) {
      deleteIngredient.mutate(deleteId);
      setDeleteId(null);
    }
  };
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (formMode === "create") {
      createIngredient.mutate(values, {
        onSuccess: () => {
          setIsFormOpen(false);
          form.reset();
        }
      });
    } else if (formMode === "edit" && selectedIngredient) {
      updateIngredient.mutate(
        { id: selectedIngredient.id, ingredient: values },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setSelectedIngredient(null);
            form.reset();
          }
        }
      );
    }
  };
  
  const isPending = 
    createIngredient.isPending || 
    updateIngredient.isPending || 
    deleteIngredient.isPending;

  // Group ingredients by category (for card view)
  const groupedIngredients = filteredIngredients.reduce((acc, ingredient) => {
    // Check for allergens to determine category
    const allergens = ingredient.allergens || [];
    let category = "other";
    
    if (allergens.includes("gluten")) {
      category = "grains";
    } else if (allergens.includes("milk")) {
      category = "dairy";
    } else if (allergens.includes("eggs")) {
      category = "eggs";
    } else if (allergens.includes("fish") || allergens.includes("crustaceans") || allergens.includes("molluscs")) {
      category = "seafood";
    } else if (allergens.includes("nuts") || allergens.includes("peanuts")) {
      category = "nuts";
    }
    
    acc[category] = acc[category] || [];
    acc[category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);
  
  // Format allergens for display
  const formatAllergens = (allergens?: string[]) => {
    if (!allergens || allergens.length === 0 || allergens.includes("none")) {
      return "None";
    }
    return allergens.join(", ");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-slab font-bold text-neutral-900">Ingredients</h1>
          <p className="text-neutral-600 mt-1">
            Manage your inventory of ingredients and their costs
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            className="bg-primary text-white hover:bg-primary/90"
            onClick={handleAddNew}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Ingredient
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={18} />
          <Input
            type="text"
            placeholder="Search ingredients..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Ingredients List */}
      <Tabs defaultValue="table" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle>Ingredients Database</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : filteredIngredients.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
                  <div className="mb-4">
                    <PlusCircle className="h-12 w-12 mx-auto text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">No ingredients found</h3>
                  <p className="text-neutral-500 mb-6">
                    {searchTerm
                      ? "No ingredients match your search. Try different keywords."
                      : "Get started by adding your first ingredient"}
                  </p>
                  <Button
                    className="bg-primary text-white hover:bg-primary/90"
                    onClick={handleAddNew}
                  >
                    Add New Ingredient
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/4">Name</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Allergens</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIngredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                          <TableCell className="font-medium">{ingredient.name}</TableCell>
                          <TableCell>
                            {formatCurrency(parseFloat(ingredient.unitCost as string))}
                          </TableCell>
                          <TableCell>{ingredient.unit}</TableCell>
                          <TableCell>
                            {ingredient.allergens && ingredient.allergens.length > 0 && !ingredient.allergens.includes("none") ? (
                              <div className="flex flex-wrap gap-1">
                                {ingredient.allergens.map((allergen) => (
                                  <Badge key={allergen} variant="outline" className="text-xs bg-orange-50 border-orange-200">
                                    {allergen}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-neutral-500">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {ingredient.supplier || <span className="text-neutral-500">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(ingredient)}
                              className="mr-1"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(ingredient.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cards">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-52" />
              ))}
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-dashed border-neutral-200">
              <div className="mb-4">
                <PlusCircle className="h-12 w-12 mx-auto text-neutral-300" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No ingredients found</h3>
              <p className="text-neutral-500 mb-6">
                {searchTerm
                  ? "No ingredients match your search. Try different keywords."
                  : "Get started by adding your first ingredient"}
              </p>
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleAddNew}
              >
                Add New Ingredient
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedIngredients).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-neutral-700 mb-3 capitalize">
                    {category === "other" ? "Other Ingredients" : `${category} Products`}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((ingredient) => (
                      <Card key={ingredient.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">{ingredient.name}</h4>
                              <p className="text-neutral-500 text-sm">
                                {ingredient.supplier || "No supplier specified"}
                              </p>
                            </div>
                            <div className="flex">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(ingredient)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(ingredient.id)}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-neutral-500">Unit Cost</p>
                              <p className="font-medium">
                                {formatCurrency(parseFloat(ingredient.unitCost as string))}/{ingredient.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-neutral-500">Allergens</p>
                              <p className="font-medium">
                                {ingredient.allergens && ingredient.allergens.some(a => a !== "none") ? (
                                  <span className="text-orange-500 text-sm flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {formatAllergens(ingredient.allergens)}
                                  </span>
                                ) : (
                                  <span className="text-green-600 text-sm">None</span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          {ingredient.notes && (
                            <div className="mt-3 pt-3 border-t text-sm text-neutral-600">
                              {ingredient.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ingredient Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add New Ingredient" : "Edit Ingredient"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create" 
                ? "Fill in the details to add a new ingredient to your database." 
                : "Update the ingredient details as needed."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Olive Oil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Cost (€)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. 0.015" 
                          type="number" 
                          min="0" 
                          step="0.001" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Cost per unit (e.g. €0.015 per gram)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitOptions.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="allergens"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Allergens</FormLabel>
                      <FormDescription>
                        Select all allergens present in this ingredient
                      </FormDescription>
                    </div>
                    {allergenOptions.map((allergen) => (
                      <FormField
                        key={allergen}
                        control={form.control}
                        name="allergens"
                        render={({ field }) => {
                          // Special handling for "none" option
                          // If "none" is checked, uncheck all others and vice versa
                          const handleAllergenChange = (checked: boolean) => {
                            if (allergen === "none" && checked) {
                              // If "none" is checked, clear all other allergens
                              return field.onChange(["none"]);
                            } else if (allergen !== "none" && checked) {
                              // If any other allergen is checked, remove "none"
                              const newValue = [...field.value || []];
                              const noneIndex = newValue.indexOf("none");
                              if (noneIndex !== -1) {
                                newValue.splice(noneIndex, 1);
                              }
                              if (!newValue.includes(allergen)) {
                                newValue.push(allergen);
                              }
                              return field.onChange(newValue);
                            } else {
                              // If unchecking an allergen
                              const newValue = field.value?.filter(
                                (value) => value !== allergen
                              ) || [];
                              // If all allergens are unchecked, add "none"
                              if (newValue.length === 0) {
                                newValue.push("none");
                              }
                              return field.onChange(newValue);
                            }
                          };
                          
                          return (
                            <FormItem
                              key={allergen}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(allergen)}
                                  onCheckedChange={handleAllergenChange}
                                />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                {allergen}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Local Farmer's Market" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information about the ingredient..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {formMode === "create" ? "Add Ingredient" : "Update Ingredient"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ingredient.
              If this ingredient is used in any recipes, it may affect cost calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
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
