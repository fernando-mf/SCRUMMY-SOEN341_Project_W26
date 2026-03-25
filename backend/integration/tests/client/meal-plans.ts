import { PaginatedResponse } from "@api/helpers/pagination";
import { CreateMealPlanRequest, IMealPlansService, MealPlan, UpdateMealPlanRequest } from "@api/meal-plans";
import { ApiClient } from "./internal";

export class MealPlansHttpClient implements IMealPlansService {
  constructor(private client: ApiClient) {}
  
  Create(authorId: number, request: CreateMealPlanRequest): Promise<MealPlan> {
    return this.client.Request({
      url: `/api/meal-plans`,
      method: "POST",
      body: request,
    });
  }

  Update(userId: number, mealPlanId: number, request: UpdateMealPlanRequest): Promise<void> {
    return this.client.Request({
      url: `/api/meal-plans/${mealPlanId}`,
      method: "PUT",
      body: request,
    });
  }

  Delete(userId: number, mealPlanId: number): Promise<void> {
    return this.client.Request({
      url: `/api/meal-plans/${mealPlanId}`,
      method: "DELETE",
    });
  }

  Get(mealPlanId: number): Promise<MealPlan> {
    return this.client.Request({
      url: `/api/meal-plans/${mealPlanId}`,
      method: "GET",
    });
  }

}
