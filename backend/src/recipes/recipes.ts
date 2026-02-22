import { z } from "zod";
import { PaginatedResponse, PaginationQuery } from "@api/helpers/pagination";

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
  authorID: number;
  ingredients: Ingredient[];
  prepTimeMinutes: number;
  prepSteps: string;
  cost: number;
  difficulty: Difficulty;
  dietaryTags: string[];
  allergens: string;
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

export interface ListRecipesRequest extends PaginationQuery {
  authors?: number[];
}

export type ListRecipesResponse = PaginatedResponse<Recipe>;

//Interfaces
export interface IRecipesService {
  Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe>;
  Update(userID: number, recipeID: number, request: UpdateRecipeRequest): Promise<void>;
  Delete(userID: number, recipeID: number): Promise<void>;
  List(req: ListRecipesRequest): Promise<ListRecipesResponse>;
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

  async Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe> {
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

  async List(): Promise<ListRecipesResponse> {
    throw new Error("Method not implemented.");
  }

  async Get(recipeID: number): Promise<Recipe> {
    return await this.repository.Get(recipeID);
  }
}
