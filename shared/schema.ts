import { pgTable, text, serial, integer, boolean, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Units of measurement
export const unitOptions = [
  "g", // grams
  "kg", // kilograms
  "ml", // milliliters
  "cl", // centiliters
  "L", // liters
  "pcs", // pieces
  "tbsp", // tablespoon
  "tsp", // teaspoon
  "cup", // cup
  "oz", // ounce
] as const;

export type Unit = typeof unitOptions[number];

// Allergens
export const allergenOptions = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soybeans",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
  "none"
] as const;

export type Allergen = typeof allergenOptions[number];

// Categories
export const categoryOptions = [
  "main", // Main dish
  "appetizer", // Appetizer/Starter
  "dessert", // Dessert
  "cocktail", // Cocktail
  "beverage", // Non-alcoholic beverage
  "salad", // Salad
  "sauce", // Sauce
  "soup", // Soup
  "side", // Side dish
  "breakfast", // Breakfast
] as const;

export type Category = typeof categoryOptions[number];

// Subcategories
export const subcategoryOptions = [
  "italian",
  "french",
  "asian",
  "mexican",
  "american",
  "spanish",
  "greek",
  "japanese",
  "indian",
  "thai",
  "middle_eastern",
  "vegan",
  "vegetarian",
  "gluten_free",
  "fusion",
  "rum",
  "vodka",
  "gin",
  "whiskey",
  "tequila",
  "wine",
  "none",
] as const;

export type Subcategory = typeof subcategoryOptions[number];

// Ingredients schema
export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  unitCost: numeric("unit_cost").notNull(),
  unit: text("unit").$type<Unit>().notNull(),
  allergens: text("allergens").array().$type<Allergen[]>(),
  supplier: text("supplier"),
  notes: text("notes"),
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
});

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

// Recipe Ingredients schema
export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  ingredientId: integer("ingredient_id").notNull(),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").$type<Unit>().notNull(),
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
  id: true,
});

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;

// Steps schema
export const steps = pgTable("steps", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull(),
  stepNumber: integer("step_number").notNull(),
  description: text("description").notNull(),
});

export const insertStepSchema = createInsertSchema(steps).omit({
  id: true,
});

export type Step = typeof steps.$inferSelect;
export type InsertStep = z.infer<typeof insertStepSchema>;

// Equipment schema
export const equipmentOptions = [
  "pot",
  "pan",
  "skillet",
  "oven",
  "mixer",
  "blender",
  "food_processor",
  "grill",
  "knife",
  "cutting_board",
  "measuring_cups",
  "measuring_spoons",
  "colander",
  "grater",
  "shaker",
  "jigger",
  "strainer",
  "muddler",
  "bar_spoon",
] as const;

export type Equipment = typeof equipmentOptions[number];

// Recipes schema
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").$type<Category>().notNull(),
  subcategory: text("subcategory").$type<Subcategory>(),
  servings: integer("servings").notNull(),
  prepTime: integer("prep_time").notNull(), // in minutes
  totalCost: numeric("total_cost"),
  costPerServing: numeric("cost_per_serving"),
  sellingPrice: numeric("selling_price"),
  profitMargin: numeric("profit_margin"),
  notes: text("notes"),
  equipment: text("equipment").array().$type<Equipment[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  totalCost: true,
  costPerServing: true,
  profitMargin: true,
  createdAt: true,
  updatedAt: true,
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

// Full Recipe with ingredients and steps
export type FullRecipe = Recipe & {
  ingredients: (RecipeIngredient & {
    ingredient: Ingredient;
  })[];
  steps: Step[];
};

// For recipe search and filtering
export const recipeFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  sortBy: z.enum(['name', 'cost_low', 'cost_high', 'margin']).optional(),
});

export type RecipeFilter = z.infer<typeof recipeFilterSchema>;
