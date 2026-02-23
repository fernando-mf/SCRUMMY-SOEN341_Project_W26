import { z } from "zod";
import { InvalidParamsError } from "@api/helpers/errors";
import { PaginatedResponse, PaginationQuerySchema } from "@api/helpers/pagination";

export enum Unit {
  G = "g",
  ML = "ml",
  TBSP = "tbsp",
  TSP = "tsp",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export type Ingredient = {
  name: string;
  amount: number;
  unit: Unit;
};

export type Recipe = {
  id: number;
  authorId: number;
  name: string;
  ingredients: Ingredient[];
  prepTimeMinutes: number;
  prepSteps: string;
  cost: number;
  difficulty: Difficulty;
  dietaryTags: string[];
  allergens: string[];
  servings: number;
};

//Request Schemas

const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.enum(Unit),
});

const createRecipeRequestSchema = z.object({
  name: z.string().min(1),
  ingredients: z.array(ingredientSchema).min(1),
  prepTimeMinutes: z.number().int().positive(),
  prepSteps: z.string().min(1),
  cost: z.number().nonnegative(),
  difficulty: z.enum(Difficulty),
  dietaryTags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  servings: z.number().int().positive(),
});

export type CreateRecipeRequest = z.infer<typeof createRecipeRequestSchema>;

const updateRecipeRequestSchema = createRecipeRequestSchema.partial();

export type UpdateRecipeRequest = z.infer<typeof updateRecipeRequestSchema>;

const listRecipesRequestSchema = PaginationQuerySchema.extend({
  authors: z.array(z.number()).default([]),
});

export type ListRecipesRequest = z.infer<typeof listRecipesRequestSchema>;

export type ListRecipesResponse = PaginatedResponse<Recipe>;

// Interfaces
export interface IRecipesService {
  Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe>;
  Update(userID: number, recipeID: number, request: UpdateRecipeRequest): Promise<void>;
  Delete(userID: number, recipeID: number): Promise<void>;
  List(req: Partial<ListRecipesRequest>): Promise<ListRecipesResponse>;
  Get(recipeID: number): Promise<Recipe>;
}

export interface IRecipesRepository {
  Create(recipe: Omit<Recipe, "id">): Promise<Recipe>;
  Update(userID: number, recipeID: number, recipe: Recipe): Promise<void>;
  Delete(userID: number, recipeID: number): Promise<void>;
  List(params: ListRecipesRequest): Promise<ListRecipesResponse>;
  Get(recipeID: number): Promise<Recipe>;
}

export class RecipesService implements IRecipesService {
  constructor(private repository: IRecipesRepository) {}

  async Create(authorId: number, request: CreateRecipeRequest): Promise<Recipe> {
    const validation = createRecipeRequestSchema.safeParse(request);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const createdRecipe = this.repository.Create({
      authorId,
      ...validation.data
    });

    return createdRecipe;
  }

  async Update(userID: number, recipeID: number, request: UpdateRecipeRequest): Promise<void> {
    //TODO
    /*
    Putting this as reference for implementation
    const recipeID = Number(req.params.recipeID); 

    const existingRecipe = await service.Get(recipeID);

    if (existingRecipe.authorID !== authorID) {
      throw new ForbiddenError("you cannot delete this recipe");
    }
    */
    throw new Error("Method not implemented.");
  }

  async Delete(userID: number, recipeID: number): Promise<void> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async List(rawQuery: Partial<ListRecipesRequest>): Promise<ListRecipesResponse> {
    const validation = listRecipesRequestSchema.safeParse(rawQuery);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    return this.repository.List(validation.data);
  }

  async Get(recipeID: number): Promise<Recipe> {
    return await this.repository.Get(recipeID);
  }
}
