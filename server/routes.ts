import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertRecipeSchema, 
  insertIngredientSchema, 
  insertRecipeIngredientSchema, 
  insertStepSchema,
  recipeFilterSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = "/api";

  // INGREDIENTS ROUTES
  
  // Get all ingredients
  app.get(`${apiRouter}/ingredients`, async (_req: Request, res: Response) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredients" });
    }
  });

  // Get ingredient by ID
  app.get(`${apiRouter}/ingredients/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const ingredient = await storage.getIngredient(id);
      
      if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.json(ingredient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ingredient" });
    }
  });

  // Create ingredient
  app.post(`${apiRouter}/ingredients`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(validatedData);
      res.status(201).json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ingredient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ingredient" });
    }
  });

  // Update ingredient
  app.patch(`${apiRouter}/ingredients/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = insertIngredientSchema.partial().parse(req.body);
      
      const updatedIngredient = await storage.updateIngredient(id, validatedData);
      
      if (!updatedIngredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.json(updatedIngredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid ingredient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update ingredient" });
    }
  });

  // Delete ingredient
  app.delete(`${apiRouter}/ingredients/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deleteIngredient(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete ingredient" });
    }
  });

  // RECIPES ROUTES
  
  // Get all recipes with optional filters
  app.get(`${apiRouter}/recipes`, async (req: Request, res: Response) => {
    try {
      // Extract query parameters
      const filter = recipeFilterSchema.parse({
        search: req.query.search,
        category: req.query.category,
        subcategory: req.query.subcategory,
        sortBy: req.query.sortBy
      });
      
      const recipes = await storage.getRecipes(filter);
      res.json(recipes);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  // Get recipe by ID (full details)
  app.get(`${apiRouter}/recipes/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const recipe = await storage.getFullRecipe(id);
      
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  // Create recipe
  app.post(`${apiRouter}/recipes`, async (req: Request, res: Response) => {
    try {
      const validatedData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(validatedData);
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recipe" });
    }
  });

  // Update recipe
  app.patch(`${apiRouter}/recipes/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = insertRecipeSchema.partial().parse(req.body);
      
      const updatedRecipe = await storage.updateRecipe(id, validatedData);
      
      if (!updatedRecipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // If selling price was updated, recalculate costs and margins
      if (validatedData.sellingPrice !== undefined) {
        await storage.calculateRecipeCosts(id);
      }
      
      // Get the updated recipe after cost calculations
      const finalRecipe = await storage.getRecipe(id);
      
      res.json(finalRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipe" });
    }
  });

  // Delete recipe
  app.delete(`${apiRouter}/recipes/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deleteRecipe(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // RECIPE INGREDIENTS ROUTES
  
  // Get all ingredients for a recipe
  app.get(`${apiRouter}/recipes/:id/ingredients`, async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id, 10);
      const recipeIngredients = await storage.getRecipeIngredients(recipeId);
      res.json(recipeIngredients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe ingredients" });
    }
  });

  // Add ingredient to recipe
  app.post(`${apiRouter}/recipes/:id/ingredients`, async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id, 10);
      
      // Ensure recipe exists
      const recipe = await storage.getRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Validate ingredient data
      const validatedData = insertRecipeIngredientSchema.parse({
        ...req.body,
        recipeId
      });
      
      // Ensure ingredient exists
      const ingredient = await storage.getIngredient(validatedData.ingredientId);
      if (!ingredient) {
        return res.status(404).json({ message: "Ingredient not found" });
      }
      
      const recipeIngredient = await storage.addIngredientToRecipe(validatedData);
      
      // Get the updated recipe with costs
      const updatedRecipe = await storage.getRecipe(recipeId);
      
      res.status(201).json({ 
        recipeIngredient,
        recipeCosts: {
          totalCost: updatedRecipe!.totalCost,
          costPerServing: updatedRecipe!.costPerServing,
          profitMargin: updatedRecipe!.profitMargin
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe ingredient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add ingredient to recipe" });
    }
  });

  // Update recipe ingredient
  app.patch(`${apiRouter}/recipe-ingredients/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = insertRecipeIngredientSchema.partial().parse(req.body);
      
      const updatedRecipeIngredient = await storage.updateRecipeIngredient(id, validatedData);
      
      if (!updatedRecipeIngredient) {
        return res.status(404).json({ message: "Recipe ingredient not found" });
      }
      
      // Get the updated recipe with costs
      const updatedRecipe = await storage.getRecipe(updatedRecipeIngredient.recipeId);
      
      res.json({ 
        recipeIngredient: updatedRecipeIngredient,
        recipeCosts: {
          totalCost: updatedRecipe!.totalCost,
          costPerServing: updatedRecipe!.costPerServing,
          profitMargin: updatedRecipe!.profitMargin
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid recipe ingredient data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recipe ingredient" });
    }
  });

  // Remove ingredient from recipe
  app.delete(`${apiRouter}/recipe-ingredients/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      // Get the recipe ID before deleting
      const recipeIngredient = await storage.recipeIngredientsMap.get(id);
      if (!recipeIngredient) {
        return res.status(404).json({ message: "Recipe ingredient not found" });
      }
      
      const recipeId = recipeIngredient.recipeId;
      const deleted = await storage.removeIngredientFromRecipe(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Recipe ingredient not found" });
      }
      
      // Get the updated recipe with costs
      const updatedRecipe = await storage.getRecipe(recipeId);
      
      res.json({
        success: true,
        recipeCosts: {
          totalCost: updatedRecipe!.totalCost,
          costPerServing: updatedRecipe!.costPerServing,
          profitMargin: updatedRecipe!.profitMargin
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove ingredient from recipe" });
    }
  });

  // RECIPE STEPS ROUTES
  
  // Get all steps for a recipe
  app.get(`${apiRouter}/recipes/:id/steps`, async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id, 10);
      const steps = await storage.getRecipeSteps(recipeId);
      res.json(steps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recipe steps" });
    }
  });

  // Add step to recipe
  app.post(`${apiRouter}/recipes/:id/steps`, async (req: Request, res: Response) => {
    try {
      const recipeId = parseInt(req.params.id, 10);
      
      // Ensure recipe exists
      const recipe = await storage.getRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      // Get current steps to determine next step number
      const currentSteps = await storage.getRecipeSteps(recipeId);
      const nextStepNumber = currentSteps.length > 0 
        ? Math.max(...currentSteps.map(s => s.stepNumber)) + 1 
        : 1;
      
      // Validate step data
      const validatedData = insertStepSchema.parse({
        ...req.body,
        recipeId,
        stepNumber: req.body.stepNumber || nextStepNumber
      });
      
      const step = await storage.addStepToRecipe(validatedData);
      res.status(201).json(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid step data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add step to recipe" });
    }
  });

  // Update recipe step
  app.patch(`${apiRouter}/steps/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = insertStepSchema.partial().parse(req.body);
      
      const updatedStep = await storage.updateStep(id, validatedData);
      
      if (!updatedStep) {
        return res.status(404).json({ message: "Step not found" });
      }
      
      res.json(updatedStep);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid step data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update step" });
    }
  });

  // Delete recipe step
  app.delete(`${apiRouter}/steps/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deleteStep(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Step not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete step" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
