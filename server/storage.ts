import {
  User, InsertUser, users,
  Ingredient, InsertIngredient, ingredients,
  Recipe, InsertRecipe, recipes,
  RecipeIngredient, InsertRecipeIngredient, recipeIngredients,
  Step, InsertStep, steps,
  FullRecipe,
  RecipeFilter
} from "@shared/schema";

// Modify the interface with CRUD methods needed
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ingredient methods
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: number): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined>;
  deleteIngredient(id: number): Promise<boolean>;
  
  // Recipe methods
  getRecipes(filter?: RecipeFilter): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  getFullRecipe(id: number): Promise<FullRecipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: number, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Recipe Ingredient methods
  getRecipeIngredients(recipeId: number): Promise<(RecipeIngredient & { ingredient: Ingredient })[]>;
  addIngredientToRecipe(recipeIngredient: InsertRecipeIngredient): Promise<RecipeIngredient>;
  updateRecipeIngredient(id: number, recipeIngredient: Partial<InsertRecipeIngredient>): Promise<RecipeIngredient | undefined>;
  removeIngredientFromRecipe(id: number): Promise<boolean>;
  
  // Step methods
  getRecipeSteps(recipeId: number): Promise<Step[]>;
  addStepToRecipe(step: InsertStep): Promise<Step>;
  updateStep(id: number, step: Partial<InsertStep>): Promise<Step | undefined>;
  deleteStep(id: number): Promise<boolean>;
  
  // Calculation methods
  calculateRecipeCosts(id: number): Promise<{ totalCost: number; costPerServing: number; profitMargin: number | null }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ingredientsMap: Map<number, Ingredient>;
  private recipesMap: Map<number, Recipe>;
  private recipeIngredientsMap: Map<number, RecipeIngredient>;
  private stepsMap: Map<number, Step>;
  
  private userIdCounter: number;
  private ingredientIdCounter: number;
  private recipeIdCounter: number;
  private recipeIngredientIdCounter: number;
  private stepIdCounter: number;

  constructor() {
    this.users = new Map();
    this.ingredientsMap = new Map();
    this.recipesMap = new Map();
    this.recipeIngredientsMap = new Map();
    this.stepsMap = new Map();
    
    this.userIdCounter = 1;
    this.ingredientIdCounter = 1;
    this.recipeIdCounter = 1;
    this.recipeIngredientIdCounter = 1;
    this.stepIdCounter = 1;
    
    // Add some sample ingredients
    this.createIngredient({
      name: "Spaghetti",
      unitCost: "0.002", // €0.002 per gram (€2 per kg)
      unit: "g",
      allergens: ["gluten"],
      supplier: "Local Supplier",
      notes: "Dried pasta"
    });
    
    this.createIngredient({
      name: "Eggs",
      unitCost: "0.25", // €0.25 per piece
      unit: "pcs",
      allergens: ["eggs"],
      supplier: "Local Farm",
      notes: "Free-range eggs"
    });
    
    this.createIngredient({
      name: "Guanciale",
      unitCost: "0.028", // €0.028 per gram (€28 per kg)
      unit: "g",
      allergens: ["none"],
      supplier: "Italian Importer",
      notes: "Cured pork cheek"
    });
    
    this.createIngredient({
      name: "Pecorino Romano",
      unitCost: "0.025", // €0.025 per gram (€25 per kg)
      unit: "g",
      allergens: ["milk"],
      supplier: "Italian Importer",
      notes: "Aged sheep's milk cheese"
    });
    
    this.createIngredient({
      name: "Black Pepper",
      unitCost: "0.05", // €0.05 per gram
      unit: "g",
      allergens: ["none"],
      supplier: "Spice Trader",
      notes: "Freshly ground"
    });
    
    this.createIngredient({
      name: "Salt",
      unitCost: "0.001", // €0.001 per gram (€1 per kg)
      unit: "g",
      allergens: ["none"],
      supplier: "Local Supplier",
      notes: "Kosher salt"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Ingredient methods
  async getIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredientsMap.values());
  }
  
  async getIngredient(id: number): Promise<Ingredient | undefined> {
    return this.ingredientsMap.get(id);
  }
  
  async createIngredient(insertIngredient: InsertIngredient): Promise<Ingredient> {
    const id = this.ingredientIdCounter++;
    const ingredient: Ingredient = { ...insertIngredient, id };
    this.ingredientsMap.set(id, ingredient);
    return ingredient;
  }
  
  async updateIngredient(id: number, updateData: Partial<InsertIngredient>): Promise<Ingredient | undefined> {
    const ingredient = this.ingredientsMap.get(id);
    if (!ingredient) return undefined;
    
    const updatedIngredient = { ...ingredient, ...updateData };
    this.ingredientsMap.set(id, updatedIngredient);
    return updatedIngredient;
  }
  
  async deleteIngredient(id: number): Promise<boolean> {
    return this.ingredientsMap.delete(id);
  }
  
  // Recipe methods
  async getRecipes(filter?: RecipeFilter): Promise<Recipe[]> {
    let recipes = Array.from(this.recipesMap.values());
    
    if (filter) {
      // Filter by search term
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        recipes = recipes.filter(recipe => 
          recipe.name.toLowerCase().includes(searchTerm)
        );
      }
      
      // Filter by category
      if (filter.category) {
        recipes = recipes.filter(recipe => recipe.category === filter.category);
      }
      
      // Filter by subcategory
      if (filter.subcategory) {
        recipes = recipes.filter(recipe => recipe.subcategory === filter.subcategory);
      }
      
      // Sort recipes
      if (filter.sortBy) {
        switch (filter.sortBy) {
          case 'name':
            recipes.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'cost_low':
            recipes.sort((a, b) => {
              // Handle recipes with undefined costs
              if (a.costPerServing === null || a.costPerServing === undefined) return 1;
              if (b.costPerServing === null || b.costPerServing === undefined) return -1;
              return Number(a.costPerServing) - Number(b.costPerServing);
            });
            break;
          case 'cost_high':
            recipes.sort((a, b) => {
              // Handle recipes with undefined costs
              if (a.costPerServing === null || a.costPerServing === undefined) return 1;
              if (b.costPerServing === null || b.costPerServing === undefined) return -1;
              return Number(b.costPerServing) - Number(a.costPerServing);
            });
            break;
          case 'margin':
            recipes.sort((a, b) => {
              // Handle recipes with undefined profit margins
              if (a.profitMargin === null || a.profitMargin === undefined) return 1;
              if (b.profitMargin === null || b.profitMargin === undefined) return -1;
              return Number(b.profitMargin) - Number(a.profitMargin);
            });
            break;
        }
      }
    }
    
    return recipes;
  }
  
  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipesMap.get(id);
  }
  
  async getFullRecipe(id: number): Promise<FullRecipe | undefined> {
    const recipe = this.recipesMap.get(id);
    if (!recipe) return undefined;
    
    const recipeIngredients = await this.getRecipeIngredients(id);
    const steps = await this.getRecipeSteps(id);
    
    return {
      ...recipe,
      ingredients: recipeIngredients,
      steps: steps
    };
  }
  
  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.recipeIdCounter++;
    const now = new Date();
    
    const recipe: Recipe = {
      ...insertRecipe,
      id,
      totalCost: null,
      costPerServing: null,
      profitMargin: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.recipesMap.set(id, recipe);
    return recipe;
  }
  
  async updateRecipe(id: number, updateData: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const recipe = this.recipesMap.get(id);
    if (!recipe) return undefined;
    
    const updatedRecipe = { 
      ...recipe, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.recipesMap.set(id, updatedRecipe);
    return updatedRecipe;
  }
  
  async deleteRecipe(id: number): Promise<boolean> {
    // Also delete associated recipe ingredients and steps
    const recipeIngredients = this.getRecipeIngredientsByRecipeId(id);
    for (const ri of recipeIngredients) {
      this.recipeIngredientsMap.delete(ri.id);
    }
    
    const recipeSteps = this.getStepsByRecipeId(id);
    for (const step of recipeSteps) {
      this.stepsMap.delete(step.id);
    }
    
    return this.recipesMap.delete(id);
  }
  
  // Recipe Ingredient methods
  private getRecipeIngredientsByRecipeId(recipeId: number): RecipeIngredient[] {
    return Array.from(this.recipeIngredientsMap.values())
      .filter(ri => ri.recipeId === recipeId);
  }
  
  async getRecipeIngredients(recipeId: number): Promise<(RecipeIngredient & { ingredient: Ingredient })[]> {
    const recipeIngredients = this.getRecipeIngredientsByRecipeId(recipeId);
    
    return Promise.all(
      recipeIngredients.map(async ri => {
        const ingredient = await this.getIngredient(ri.ingredientId);
        return {
          ...ri,
          ingredient: ingredient!
        };
      })
    );
  }
  
  async addIngredientToRecipe(insertRecipeIngredient: InsertRecipeIngredient): Promise<RecipeIngredient> {
    const id = this.recipeIngredientIdCounter++;
    const recipeIngredient: RecipeIngredient = { ...insertRecipeIngredient, id };
    this.recipeIngredientsMap.set(id, recipeIngredient);
    
    // Update recipe costs
    await this.calculateRecipeCosts(recipeIngredient.recipeId);
    
    return recipeIngredient;
  }
  
  async updateRecipeIngredient(id: number, updateData: Partial<InsertRecipeIngredient>): Promise<RecipeIngredient | undefined> {
    const recipeIngredient = this.recipeIngredientsMap.get(id);
    if (!recipeIngredient) return undefined;
    
    const updatedRecipeIngredient = { ...recipeIngredient, ...updateData };
    this.recipeIngredientsMap.set(id, updatedRecipeIngredient);
    
    // Update recipe costs
    await this.calculateRecipeCosts(recipeIngredient.recipeId);
    
    return updatedRecipeIngredient;
  }
  
  async removeIngredientFromRecipe(id: number): Promise<boolean> {
    const recipeIngredient = this.recipeIngredientsMap.get(id);
    if (!recipeIngredient) return false;
    
    const recipeId = recipeIngredient.recipeId;
    const deleted = this.recipeIngredientsMap.delete(id);
    
    // Update recipe costs
    if (deleted) {
      await this.calculateRecipeCosts(recipeId);
    }
    
    return deleted;
  }
  
  // Step methods
  private getStepsByRecipeId(recipeId: number): Step[] {
    return Array.from(this.stepsMap.values())
      .filter(step => step.recipeId === recipeId)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  }
  
  async getRecipeSteps(recipeId: number): Promise<Step[]> {
    return this.getStepsByRecipeId(recipeId);
  }
  
  async addStepToRecipe(insertStep: InsertStep): Promise<Step> {
    const id = this.stepIdCounter++;
    const step: Step = { ...insertStep, id };
    this.stepsMap.set(id, step);
    return step;
  }
  
  async updateStep(id: number, updateData: Partial<InsertStep>): Promise<Step | undefined> {
    const step = this.stepsMap.get(id);
    if (!step) return undefined;
    
    const updatedStep = { ...step, ...updateData };
    this.stepsMap.set(id, updatedStep);
    return updatedStep;
  }
  
  async deleteStep(id: number): Promise<boolean> {
    const step = this.stepsMap.get(id);
    if (!step) return false;
    
    // Reorder remaining steps
    const recipeId = step.recipeId;
    const deletedStepNumber = step.stepNumber;
    
    // Delete the step
    const deleted = this.stepsMap.delete(id);
    
    if (deleted) {
      // Update step numbers for steps that come after the deleted step
      const stepsToUpdate = Array.from(this.stepsMap.values())
        .filter(s => s.recipeId === recipeId && s.stepNumber > deletedStepNumber);
      
      for (const stepToUpdate of stepsToUpdate) {
        stepToUpdate.stepNumber -= 1;
        this.stepsMap.set(stepToUpdate.id, stepToUpdate);
      }
    }
    
    return deleted;
  }
  
  // Calculation methods
  async calculateRecipeCosts(id: number): Promise<{ totalCost: number; costPerServing: number; profitMargin: number | null }> {
    const recipe = await this.getRecipe(id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }
    
    const recipeIngredients = await this.getRecipeIngredients(id);
    
    let totalCost = 0;
    
    for (const ri of recipeIngredients) {
      const { quantity } = ri;
      const { unitCost } = ri.ingredient;
      
      // Calculate cost of this ingredient in the recipe
      totalCost += Number(quantity) * Number(unitCost);
    }
    
    const costPerServing = totalCost / recipe.servings;
    
    // Calculate profit margin if selling price exists
    let profitMargin: number | null = null;
    if (recipe.sellingPrice) {
      profitMargin = ((Number(recipe.sellingPrice) - costPerServing) / Number(recipe.sellingPrice)) * 100;
    }
    
    // Update recipe with calculated costs
    const updatedRecipe = {
      ...recipe,
      totalCost: String(totalCost),
      costPerServing: String(costPerServing),
      profitMargin: profitMargin !== null ? String(profitMargin) : null,
      updatedAt: new Date()
    };
    
    this.recipesMap.set(id, updatedRecipe);
    
    return { 
      totalCost,
      costPerServing,
      profitMargin
    };
  }
}

export const storage = new MemStorage();
