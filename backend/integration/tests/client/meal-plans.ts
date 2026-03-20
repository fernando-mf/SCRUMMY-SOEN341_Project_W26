import { PaginatedResponse } from "@api/helpers/pagination";
import { CreateMealPlanRequest, IMealPlansService, MealPlan } from "@api/meal-plans";
import { ApiClient } from "./internal";

export class MealPlansHttpClient implements IMealPlansService {
  constructor(private client: ApiClient) {}

  Create(authorId: number, request: CreateMealPlanRequest): Promise<MealPlan> {
    return this.client.Request({
      url: "/api/meal-plans",
      method: "POST",
      body: request,
    });
  }
}
