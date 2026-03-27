import {
  CreateMealPlanRequest,
  GetMealPlanByStartDateRequest,
  IMealPlansService,
  MealPlan,
  UpdateMealPlanRequest,
} from "@api/meal-plans";
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

  GetMealPlanByStartDate(userId: number, req: Partial<GetMealPlanByStartDateRequest>): Promise<MealPlan> {
    const params = new URLSearchParams();

    if (req.startDate !== undefined && req.startDate !== null) {
      params.set("startDate", req.startDate.toISOString());
    }

    return this.client.Request({
      url: `/api/meal-plans?${params}`,
      method: "GET",
    });
  }

  Get(mealPlanId: number): Promise<MealPlan> {
    return this.client.Request({
      url: `/api/meal-plans/${mealPlanId}`,
      method: "GET",
    });
  }

}
