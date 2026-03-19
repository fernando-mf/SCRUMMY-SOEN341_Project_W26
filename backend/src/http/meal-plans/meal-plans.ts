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

//Request Schemas

const mealPlanEntrySchema = z.object({
  dayOfWeek: z.enum(Object.values(DayOfWeek) as [string, ...string[]]),
  mealType: z.enum(Object.values(MealType) as [string, ...string[]]),
});

const createMealPlanSchema = z.object({
  name: z.string().min(1),
  weekNumber: z.number().int().min(1).max(52),
  startDate: z.coerce.date,
  endDate: z.coerce.date,
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
    throw new Error("Method not implemented.");
  }
  
}
