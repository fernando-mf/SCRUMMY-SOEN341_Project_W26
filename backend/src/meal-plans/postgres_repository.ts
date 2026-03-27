import postgres from "postgres";
import { InternalError, NotFoundError } from "@api/helpers/errors";
import { GetPaginationParams } from "@api/helpers/pagination";
import { IMealPlansRepository, ListMealPlansRequest, ListMealPlansResponse, MealPlan, MealPlanEntry } from "./meal-plans";

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

  async List(userId: number, req: ListMealPlansRequest): Promise<ListMealPlansResponse> {
    const whereClause = this.db`
      WHERE true
        AND m."authorId" = ${userId}
        ${this.applyIfSet(req.startDate, this.db`AND m."startDate" = ${req.startDate!}`)}
    `;

    const countResult = await this.db<{ total: number }[]>`
      SELECT COUNT(*) AS total
      FROM meal_plans m
      ${whereClause}
    `;
    const total = Number(countResult[0].total);
    if (isNaN(total)) {
      throw new InternalError("Failed to count meal plans");
    }

    const { offset, totalPages } = GetPaginationParams(total, req);

    const rawMealPlans = await this.db<MealPlan[]>`
      SELECT
        m."id",
        m."authorId",
        m."name",
        m."weekNumber",
        m."startDate",
        m."endDate"
      FROM meal_plans m
      ${whereClause}
      ORDER BY m."startDate" ASC, m."updatedAt" DESC
      LIMIT ${req.limit}
      OFFSET ${offset}
    `;

    const mealPlans = await this.fillEntries(rawMealPlans);

    return {
      currentPage: req.page,
      totalCount: total,
      totalPages,
      data: mealPlans,
    };
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

  private async fillEntries(mealPlans: MealPlan[]): Promise<MealPlan[]> {
    if (mealPlans.length === 0) {
      return [];
    }

    type rawEntry = {
      mealPlanId: number;
      recipeId: number;
      dayOfWeek: string;
      mealType: string;
    };

    const mealPlanIds = mealPlans.map((m) => m.id);
    const entries = await this.db<rawEntry[]>`
      SELECT
        "mealPlanId",
        "recipeId",
        "dayOfWeek",
        "mealType"
      FROM meal_plan_entries
      WHERE "mealPlanId" IN ${this.db(mealPlanIds)}
    `;

    const indexedEntries: Record<number, MealPlanEntry[]> = {};
    for (const i of entries) {
      (indexedEntries[i.mealPlanId] ??= []).push({
        recipeId: i.recipeId,
        dayOfWeek: i.dayOfWeek as MealPlanEntry["dayOfWeek"],
        mealType: i.mealType as MealPlanEntry["mealType"],
      });
    }

    return mealPlans.map((m) => ({
      ...m,
      entries: indexedEntries[m.id] ?? [],
    }));
  }

  private applyIfSet<T>(val: T[] | T, fragment: any) {
    let isValid = Boolean(val);
    if (Array.isArray(val)) {
      isValid = val.length > 0;
    }

    return isValid ? fragment : this.db``;
  }
}

