import postgres from "postgres";
import { IRecipesRepository, Recipe } from "./recipes";

export class RecipesRepository implements IRecipesRepository {
    constructor(private db: postgres.Sql) {}
 
    async Create(recipe: Omit<Recipe, "id">): Promise<Recipe> {
        //TODO
        throw new Error("Method not implemented.");
    }
    
    async Update(recipeID: number, recipe: Recipe): Promise<void> {
        //TODO
        throw new Error("Method not implemented.");
    }
}