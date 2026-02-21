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

//Interfaces
export interface IRecipesService {
    Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe>;
}

export interface IRecipesRepository {
    Create(recipe: Omit<Recipe, "id">): Promise<Recipe>;
}

export class RecipesService implements IRecipesService {
    constructor(private repository: IRecipesRepository) {}

    async Create(authorID: number, request: CreateRecipeRequest): Promise<Recipe> {
        //TODO
        throw new Error("Method not implemented.");
    }
    
}