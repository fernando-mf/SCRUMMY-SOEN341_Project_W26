import { z } from "zod";
import { InvalidParamsError } from "@api/helpers/errors";
import { PaginatedResponse, PaginationQuerySchema } from "@api/helpers/pagination";

export enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
}

export enum DayOfWeek {
  SUNDAY = "sunday",
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
}

export type MealPlanEntry = {
  recipeId: number;
  dayOfWeek: DayOfWeek;
  mealType: MealType;
};

export type MealPlan = {
  id: number;
  authorId: number;
  name: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  entries: MealPlanEntry[];
};

const mealPlanEntrySchema = z.object({
  recipeId: z.number().int().positive(),
  dayOfWeek: z.enum(DayOfWeek),
  mealType: z.enum(MealType),
});

const createMealPlanSchema = z.object({
  name: z.string().min(1),
  weekNumber: z.number().int().min(1).max(52),
  startDate: z.coerce.date(),
  entries: z.array(mealPlanEntrySchema).min(1),
});

export type CreateMealPlanRequest = z.infer<typeof createMealPlanSchema>;

// Interfaces
export interface IMealPlansService {
  Create(authorId: number, request: CreateMealPlanRequest): Promise<MealPlan>;
}

export interface IMealPlansRepository {
  Create(mealPlan: Omit<MealPlan, "id">): Promise<MealPlan>;
}

export class MealPlansService implements IMealPlansService {
  constructor(private repository: IMealPlansRepository) {}

  async Create(authorId: number, request: CreateMealPlanRequest): Promise<MealPlan> {
    const validation = createMealPlanSchema.safeParse(request);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const { startDate } = validation.data;

    if (!isValidWeekStart(startDate)) {
      throw new InvalidParamsError({ param: "startDate", description: "Start date must be Monday"});
    }

    const endDate = computeEndDate(startDate);

    const createdMealPlan = this.repository.Create({
      authorId,
      name: validation.data.name,
      weekNumber: validation.data.weekNumber,
      startDate: startDate,
      endDate: endDate,
      entries: validation.data.entries as MealPlanEntry[],
    });

    return createdMealPlan;
  }
}

function isValidWeekStart(date: Date): boolean {
  return date.getDay() === 1;
}

function computeEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);

  endDate.setDate(endDate.getDate() + 6);
  return endDate;
}
