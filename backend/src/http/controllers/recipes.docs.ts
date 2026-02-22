import { Body, Controller, Post, Put, Route, SuccessResponse, Response, Tags, Get, Security, Queries, Delete } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import {
  CreateRecipeRequest,
  Recipe,
  UpdateRecipeRequest,
  ListRecipesRequest,
  ListRecipesResponse,
} from "@api/recipes";

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

  @Put("{recipeID}")
  @Security("jwt")
  @SuccessResponse(HttpStatus.Ok, "Recipe Updated")
  @Response(HttpStatus.BadRequest, "Recipe Invalid")
  async updateRecipe(@Body() body: UpdateRecipeRequest): Promise<void> {
    return null as any;
  }

  @Delete("{recipeID}")
  @Security("jwt")
  @SuccessResponse(HttpStatus.NoContent, "Recipe Deleted")
  @Response(HttpStatus.BadRequest, "Recipe Invalid")
  async deleteRecipe(): Promise<void> {
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
