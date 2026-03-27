import {
  Body,
  Controller,
  Post,
  Put,
  Route,
  SuccessResponse,
  Response,
  Tags,
  Get,
  Security,
  Queries,
  Delete,
} from "tsoa";
import { HttpStatus } from "@api/helpers/http";
import { CreateMealPlanRequest, ListMealPlansRequest, ListMealPlansResponse, MealPlan, UpdateMealPlanRequest } from "@api/meal-plans";

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

  @Put("{mealPlanId}")
  @Security("jwt")
  @SuccessResponse(HttpStatus.Ok, "Meal Plan Updated")
  @Response(HttpStatus.BadRequest, "Meal Plan Invalid")
  async updateRecipe(@Body() body: UpdateMealPlanRequest): Promise<void> {
    return null as any;
  }

  @Delete("{mealPlanId}")
  @Security("jwt")
  @SuccessResponse(HttpStatus.NoContent, "Meal Plan Deleted")
  @Response(HttpStatus.BadRequest, "Meal Plan Invalid")
  async deleteRecipe(): Promise<void> {
    return null as any;
  }

  @Get()
  @Security("jwt")
  @SuccessResponse(HttpStatus.Ok, "Meal Plans List")
  @Response(HttpStatus.BadRequest, "Meal Plans query Invalid")
  async listMealPlans(@Queries() query: ListMealPlansRequest): Promise<ListMealPlansResponse> {
    return null as any;
  }

}
