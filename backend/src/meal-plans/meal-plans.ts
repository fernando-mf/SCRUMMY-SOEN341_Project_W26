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

const mealPlanEntryRequestSchema = z.object({
  recipeId: z.number().int().positive(),
  dayOfWeek: z.enum(DayOfWeek),
  mealType: z.enum(MealType),
});

const createMealPlanRequestSchema = z.object({
  name: z.string().min(1),
  weekNumber: z.number().int().min(1).max(52),
  startDate: z.coerce.date(),
  entries: z.array(mealPlanEntryRequestSchema).min(1),
});

export type CreateMealPlanRequest = z.infer<typeof createMealPlanRequestSchema>;

const updateMealPlanRequestSchema = z.object({
  name: z.string().min(1),
  weekNumber: z.number().int().min(1).max(52),
  startDate: z.coerce.date(),
  entries: z.array(mealPlanEntryRequestSchema).min(1),
});

export type UpdateMealPlanRequest = z.infer<typeof updateMealPlanRequestSchema>;

const listMealPlansRequestSchema = PaginationQuerySchema.extend({
  startDate: z.coerce.date().optional(),
});

export type ListMealPlansRequest = z.infer<typeof listMealPlansRequestSchema>;

export type ListMealPlansResponse = PaginatedResponse<MealPlan>;

// Interfaces
export interface IMealPlansService {
  Create(authorId: number, request: CreateMealPlanRequest): Promise<MealPlan>;
  Update(userId: number, mealPlanId: number, request: UpdateMealPlanRequest): Promise<void>;
  Delete(userId: number, mealPlanId: number): Promise<void>;
  List(userId: number, req: Partial<ListMealPlansRequest>): Promise<ListMealPlansResponse>;
  Get(mealPlanId: number): Promise<MealPlan>;
}

export interface IMealPlansRepository {
  Create(mealPlan: Omit<MealPlan, "id">): Promise<MealPlan>;
  Update(userId: number, mealPlanId: number, mealPlan: MealPlan): Promise<void>;
  Delete(userId: number, mealPlanId: number): Promise<void>;
  List(userId: number, req: ListMealPlansRequest): Promise<ListMealPlansResponse>;
  Get(mealPlanId: number): Promise<MealPlan>;
}

export class MealPlansService implements IMealPlansService {
  constructor(private repository: IMealPlansRepository) {}

  async Create(authorId: number, request: CreateMealPlanRequest): Promise<MealPlan> {
    const validation = createMealPlanRequestSchema.safeParse(request);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const { startDate } = validation.data;

    if (!isValidWeekStart(startDate)) {
      throw new InvalidParamsError({ param: "startDate", description: "Start date must be Monday" });
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

  async Update(userId: number, mealPlanId: number, request: UpdateMealPlanRequest): Promise<void> {
    const validation = updateMealPlanRequestSchema.safeParse(request);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const { startDate } = validation.data;

    if (!isValidWeekStart(startDate)) {
      throw new InvalidParamsError({ param: "startDate", description: "Start date must be Monday" });
    }

    const endDate = computeEndDate(startDate);

    const currentMealPlan = await this.repository.Get(mealPlanId);

    const updatedMealPlan: MealPlan = {
      id: currentMealPlan.id,
      authorId: currentMealPlan.id,
      name: validation.data.name,
      weekNumber: validation.data.weekNumber,
      startDate: startDate,
      endDate: endDate,
      entries: validation.data.entries as MealPlanEntry[],
    };

    await this.repository.Update(userId, mealPlanId, updatedMealPlan);
  }

  async Delete(userId: number, mealPlanId: number): Promise<void> {
    await this.repository.Delete(userId, mealPlanId);
  }

  async List(userId: number, rawQuery: Partial<ListMealPlansRequest>): Promise<ListMealPlansResponse> {
    const validation = listMealPlansRequestSchema.safeParse(rawQuery);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    return this.repository.List(userId, validation.data);
  }

  async Get(mealPlanId: number): Promise<MealPlan> {
    return await this.repository.Get(mealPlanId);
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
