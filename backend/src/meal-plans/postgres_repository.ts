import postgres from "postgres";
import { InternalError, NotFoundError } from "@api/helpers/errors";
import { GetPaginationParams } from "@api/helpers/pagination";
import { IMealPlansRepository, MealPlan } from "./meal-plans";

export class MealPlansRepository implements IMealPlansRepository {
  constructor(private db: postgres.Sql) {}

  async Create(mealPlan: Omit<MealPlan, "id">): Promise<MealPlan> {
    throw new Error("Method not implemented.");
  }
}
