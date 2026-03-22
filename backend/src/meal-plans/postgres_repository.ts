import postgres from "postgres";
import { InternalError, NotFoundError } from "@api/helpers/errors";
import { GetPaginationParams } from "@api/helpers/pagination";
import { IMealPlansRepository, MealPlan } from "./meal-plans";

export class MealPlansRepository implements IMealPlansRepository {
  constructor(private db: postgres.Sql) {}

  async Create(mealPlan: Omit<MealPlan, "id">): Promise<MealPlan> {
    const result = await this.db<{ id: number }[]>`
    INSERT INTO meal_plans (
      "authorId",
      "name",
      "weekNumber",
      "startDate",
      "endDate"
    ) VALUES (
      ${mealPlan.authorId},
      ${mealPlan.name},
      ${mealPlan.weekNumber},
      ${mealPlan.startDate},
      ${mealPlan.endDate}
    ) RETURNING "id"
    `;

    const mealPlanId = result[0].id;

    if (mealPlan.entries.length > 0) {
      const entryRows = mealPlan.entries.map((i) => ({
        mealPlanId,
        recipeId: i.recipeId,
        dayOfWeek: i.dayOfWeek,
        mealType: i.mealType,
      }));

      await this.db`
      INSERT INTO meal_plan_entries ${this.db(entryRows)}
    `;
    }

    return {
      id: mealPlanId,
      ...mealPlan,
    };
  }
}
