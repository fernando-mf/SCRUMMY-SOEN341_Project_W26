import { Body, Controller, Post, Route, SuccessResponse, Response, Tags, Get, Security, Queries } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { CreateRecipeRequest, ListRecipesRequest, ListRecipesResponse, Recipe } from "@api/recipes";

@Route("api/recipes")
@Tags("Recipes")
class RecipesDocs extends Controller {
  @Post()
  @Security("jwt")
  @SuccessResponse(HttpStatus.Ok, "Recipe Created")
  @Response(HttpStatus.BadRequest, "Recipe Invalid")
  async createRecipe(@Body() body: CreateRecipeRequest): Promise<Recipe> {
    return null as any;
  }

  @Get()
  @Security("jwt")
  @SuccessResponse(HttpStatus.Ok, "Recipes List")
  @Response(HttpStatus.BadRequest, "Recipes query Invalid")
  async listRecipes(@Queries() query: ListRecipesRequest): Promise<ListRecipesResponse> {
    return null as any;
  }
}
