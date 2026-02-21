import { Body, Controller, Post, Put, Route, SuccessResponse, Response, Tags } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { CreateRecipeRequest, Recipe, UpdateRecipeRequest } from "@api/recipes";

@Route("api/recipes")
@Tags("Recipes")
class RecipesDocs extends Controller {
    @Post()
    @SuccessResponse(HttpStatus.Ok, "Recipe Created")
    @Response(HttpStatus.BadRequest, "Recipe Invalid")
    async createRecipe(@Body() body: CreateRecipeRequest): Promise<Recipe> {
        return null as any;
    }

    @Put("{recipeID}")
    @SuccessResponse(HttpStatus.Ok, "Recipe Updated")
    @Response(HttpStatus.BadRequest, "Recipe Invalid")
    async updateRecipe(@Body() body: UpdateRecipeRequest): Promise<void> {
        return;
    }
}