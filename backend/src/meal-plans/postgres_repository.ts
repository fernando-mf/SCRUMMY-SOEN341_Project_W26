import postgres from "postgres";
import { InternalError, NotFoundError } from "@api/helpers/errors";
import { GetPaginationParams } from "@api/helpers/pagination";
import { IMealPlansRepository, MealPlan, MealPlanEntry } from "./meal-plans";

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

  async Update(userId: number, mealPlanId: number, mealPlan: MealPlan): Promise<void> {
    const result = await this.db`
    UPDATE meal_plans
    SET
      "name" = ${mealPlan.name},
      "weekNumber" = ${mealPlan.weekNumber},
      "startDate" = ${mealPlan.startDate},
      "endDate" = ${mealPlan.endDate},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${mealPlanId}
      AND "authorId" = ${userId}
    `;

    if (result.count === 0) {
      throw new NotFoundError("meal_plans");
    }

    await this.db`
      DELETE FROM meal_plan_entries
      WHERE "mealPlanId" = ${mealPlanId}
    `;

    if (mealPlan.entries.length > 0) {
      const rows = mealPlan.entries.map((i) => ({
        mealPlanId,
        recipeId: i.recipeId,
        dayOfWeek: i.dayOfWeek,
        mealType: i.mealType,
      }));

      await this.db`
        INSERT INTO meal_plan_entries ${this.db(rows)}
      `;
    }
  }

  async Delete(userId: number, mealPlanId: number): Promise<void> {
    const result = await this.db`
      DELETE FROM meal_plans
      WHERE "id" = ${mealPlanId}
        AND "authorId" = ${userId}
    `;

    if (result.count === 0) {
      throw new NotFoundError("meal_plan");
    }
  }

  async Get(mealPlanId: number): Promise<MealPlan> {
    const rawMealPlans = await this.db<MealPlan[]>`
    SELECT
      m."id",
      m."authorId",
      m."name",
      m."weekNumber",
      m."startDate",
      m."endDate"
    FROM meal_plans m
    WHERE m."id" = ${mealPlanId}
  `;

    if (rawMealPlans.length === 0) {
      throw new NotFoundError("meal_plan");
    }

    const mealPlan = rawMealPlans[0];

    const entries = await this.db<{ recipeId: number; dayOfWeek: string; mealType: string }[]>`
      SELECT
        "recipeId",
        "dayOfWeek",
        "mealType"
      FROM meal_plan_entries
      WHERE "mealPlanId" = ${mealPlanId}
    `;

    return {
      ...mealPlan,
      entries: entries.map((i) => ({
        recipeId: i.recipeId,
        dayOfWeek: i.dayOfWeek as MealPlanEntry["dayOfWeek"],
        mealType: i.mealType as MealPlanEntry["mealType"],
      })),
    };
  }
}

