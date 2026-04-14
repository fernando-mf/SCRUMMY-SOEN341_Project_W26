import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  CreateRecipeRequest,
  Difficulty,
  GenerateRecipeRequest,
  ILLMProvider,
  IRecipesRepository,
  ListRecipesResponse,
  Recipe,
  RecipesService,
  Unit,
} from "./recipes";

const testUserId = 1;

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 1,
    authorId: testUserId,
    name: "Test Recipe",
    ingredients: [{ name: "Flour", amount: 200, unit: Unit.G }],
    prepTimeMinutes: 15,
    prepSteps: "1. Mix\n2. Cook",
    cost: 5.0,
    difficulty: Difficulty.EASY,
    dietaryTags: ["vegan"],
    allergens: ["gluten"],
    servings: 2,
    ...overrides,
  };
}

function makeCreateRecipeRequest(overrides: Partial<CreateRecipeRequest> = {}): CreateRecipeRequest {
  return {
    name: "Test Recipe",
    ingredients: [{ name: "Flour", amount: 200, unit: Unit.G }],
    prepTimeMinutes: 15,
    prepSteps: "1. Mix\n2. Cook",
    cost: 5.0,
    difficulty: Difficulty.EASY,
    dietaryTags: ["vegan"],
    allergens: ["gluten"],
    servings: 2,
    ...overrides,
  };
}

function mockRepository(existingRecipes: Recipe[] = []): IRecipesRepository {
  let idCounter = 1;
  return {
    Create: vi.fn((recipe): Promise<Recipe> => Promise.resolve({ id: idCounter++, ...recipe })),
    Update: vi.fn(async () => {}),
    Delete: vi.fn(async () => {}),
    List: vi.fn(
      (): Promise<ListRecipesResponse> =>
        Promise.resolve({
          data: existingRecipes,
          currentPage: 1,
          totalCount: existingRecipes.length,
          totalPages: existingRecipes.length > 0 ? 1 : 0,
        }),
    ),
    Get: vi.fn((): Promise<Recipe> => Promise.resolve(makeRecipe())),
  };
}

function mockLLMProvider(response?: CreateRecipeRequest[]): ILLMProvider {
  return {
    GenerateRecipes: vi.fn((): Promise<CreateRecipeRequest[]> => Promise.resolve(response ?? [])),
  };
}

describe("RecipesService", () => {
  describe("Generate", () => {
    let repository: IRecipesRepository;

    beforeEach(() => {
      repository = mockRepository();
    });

    test("success", async () => {
      const llmRecipes = [
        makeCreateRecipeRequest({ name: "Recipe 1" }),
        makeCreateRecipeRequest({ name: "Recipe 2" }),
        makeCreateRecipeRequest({ name: "Recipe 3" }),
      ];
      const llmProvider = mockLLMProvider(llmRecipes);
      const service = new RecipesService(repository, llmProvider);

      const result = await service.Generate(testUserId, { ingredients: ["chicken"] });

      expect(result).toHaveLength(3);
      expect(repository.Create).not.toHaveBeenCalled();
      expect(llmProvider.GenerateRecipes).toHaveBeenCalledWith(["chicken"], 3, []);
      expect(result).length(3);
      expect(result[0].name).toBe("Recipe 1");
      expect(result[1].name).toBe("Recipe 2");
      expect(result[2].name).toBe("Recipe 3");
    });

    test("success with exclusions", async () => {
      const existing = [makeRecipe({ name: "Chicken Soup" }), makeRecipe({ name: "Chicken Stir Fry" })];
      repository = mockRepository(existing);
      const llmProvider = mockLLMProvider([makeCreateRecipeRequest()]);
      const service = new RecipesService(repository, llmProvider);

      await service.Generate(testUserId, { ingredients: ["chicken"] });

      expect(repository.List).toHaveBeenCalledOnce();
      expect(llmProvider.GenerateRecipes).toHaveBeenCalledWith(["chicken"], 3, ["Chicken Soup", "Chicken Stir Fry"]);
    });

    test("LLM provider failure", async () => {
      const llmProvider: ILLMProvider = {
        GenerateRecipes: vi.fn(() => {
          throw new Error("Gemini API unavailable");
        }),
      };
      const service = new RecipesService(repository, llmProvider);

      await expect(service.Generate(testUserId, { ingredients: ["chicken"] })).rejects.toThrow(
        "Gemini API unavailable",
      );
      expect(repository.Create).not.toHaveBeenCalled();
    });

    test("validation error empty ingredients", async () => {
      const llmProvider = mockLLMProvider();
      const service = new RecipesService(repository, llmProvider);

      await expect(
        service.Generate(testUserId, { ingredients: [] } as unknown as GenerateRecipeRequest),
      ).rejects.toMatchObject({ code: "invalid_params" });

      expect(llmProvider.GenerateRecipes).not.toHaveBeenCalled();
    });
  });
});
