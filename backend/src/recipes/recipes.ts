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
  servings?: number;
};

//Request Schemas
const createRecipeRequestSchema = z.object({
  //TODO
});

export type CreateRecipeRequest = z.infer<typeof createRecipeRequestSchema>;

export interface ListRecipesRequest extends PaginationQuery {
  authors?: number[];
}

export type ListRecipesResponse = PaginatedResponse<Recipe>;

//Interfaces
export interface IRecipesService {
  Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe>;
  List(req: ListRecipesRequest): Promise<ListRecipesResponse>;
}

export interface IRecipesRepository {
  Create(recipe: Omit<Recipe, "id">): Promise<Recipe>;
  List(params: ListRecipesRequest): Promise<ListRecipesResponse>;
}

export class RecipesService implements IRecipesService {
  constructor(private repository: IRecipesRepository) {}

  async Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe> {
    //TODO
    throw new Error("Method not implemented.");
  }

  async List(): Promise<ListRecipesResponse> {
    throw new Error("Method not implemented.");
  }
}
