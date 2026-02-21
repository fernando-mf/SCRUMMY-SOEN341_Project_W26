import { Body, Controller, Post, Route, SuccessResponse, Response, Tags } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { CreateRecipeRequest, Recipe } from "@api/recipes";

@Route("api/recipes")
@Tags("Recipes")
class RecipesDocs extends Controller {
    @Post()
    @SuccessResponse(HttpStatus.Ok, "Recipe Created")
    @Response(HttpStatus.BadRequest, "Recipe Invalid")
    async createRecipe(@Body() body: CreateRecipeRequest): Promise<Recipe> {
        return null as any;
    }
}