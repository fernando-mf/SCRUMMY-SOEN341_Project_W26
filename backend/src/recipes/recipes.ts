import { z } from "zod";

export enum Unit {
    G = "g",
    ML = "ml",
    TBSP = "tbsp",
    TSP = "tsp",
};

export enum Difficulty {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
};

export type Ingredient = {
    name: string;
    amount: number;
    unit: Unit;
};

export type Recipe = {
    id: number;
    authorID: number;
    ingredients: Ingredient[];
    prepTime: number;
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

const updateRecipeRequestSchema = z.object({
    //TODO
});

export type UpdateRecipeRequest = z.infer<typeof updateRecipeRequestSchema>;

//Interfaces
export interface IRecipesService {
    Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe>;
    Update(recipeID: number, request: UpdateRecipeRequest): Promise<void>;
}

export interface IRecipesRepository {
    Create(recipe: Omit<Recipe, "id">): Promise<Recipe>;
    Update(recipeID: number, recipe: Recipe): Promise<void>;
}

export class RecipesService implements IRecipesService {
    constructor(private repository: IRecipesRepository) { }

    async Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe> {
        //TODO
        throw new Error("Method not implemented.");
    }

    async Update(recipeID: number, req: UpdateRecipeRequest): Promise<void> {
        //TODO
        throw new Error("Method not implemented.");
    }

}