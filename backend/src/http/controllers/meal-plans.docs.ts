import { Body, Controller, Post, Put, Route, SuccessResponse, Response, Tags, Get, Security, Queries, Delete } from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { CreateMealPlanRequest, MealPlan } from "@api/meal-plans";

@Route("api/meal-plans")
@Tags("Meal-Plans")
class MealPlanDocs extends Controller {
  @Post()
  @Security("jwt")
  @SuccessResponse(HttpStatus.Ok, "Meal Plan Created")
  @Response(HttpStatus.BadRequest, "Meal Plan Invalid")
  async createRecipe(@Body() body: CreateMealPlanRequest): Promise<MealPlan> {
    return null as any;
  }
}
