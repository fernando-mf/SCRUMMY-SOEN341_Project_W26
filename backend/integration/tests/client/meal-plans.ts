import { CreateMealPlanRequest, IMealPlansService, ListMealPlansRequest, ListMealPlansResponse, MealPlan, UpdateMealPlanRequest } from "@api/meal-plans";
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

  List(userId: number, req: Partial<ListMealPlansRequest>): Promise<ListMealPlansResponse> {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(req)) {
      if (value === undefined || value === null) {
        continue;
      }

      const serialized = value instanceof Date ? value.toISOString() : value.toString();
      params.append(key, serialized);
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
