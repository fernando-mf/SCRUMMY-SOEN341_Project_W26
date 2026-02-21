import { CreateRecipeRequest, CreateRecipeResponse, IRecipesService } from "@api/recipes";
import { ApiClient } from "./internal";

export class RecipesHttpClient implements IRecipesService {
    constructor(private client: ApiClient) {}

    Create(authorID: number, request: CreateRecipeRequest): Promise<CreateRecipeResponse> {
        //TODO
        throw new Error("Method not implemented.");
    }

}