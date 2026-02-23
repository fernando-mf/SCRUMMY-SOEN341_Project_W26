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
const createRecipeRequestSchema = z.object({
  //TODO
});

export type CreateRecipeRequest = z.infer<typeof createRecipeRequestSchema>;

const updateRecipeRequestSchema = z.object({
  //TODO
});

export type UpdateRecipeRequest = z.infer<typeof updateRecipeRequestSchema>;

const listRecipesRequestSchema = PaginationQuerySchema.extend({
  authors: z.array(z.number()).default([]),
  search: z.string().trim().min(1).optional(),
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
    //TODO
    throw new Error("Method not implemented.");
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
