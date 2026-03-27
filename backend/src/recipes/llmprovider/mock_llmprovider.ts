import { Difficulty, Unit, type CreateRecipeRequest, type ILLMProvider } from "@api/recipes/recipes";

export class MockLLMProvider implements ILLMProvider {
  async GenerateRecipes(ingredients: string[], count: number, exclusions: string[]): Promise<CreateRecipeRequest[]> {
    return Array.from({ length: count }, (_, i) => ({
      name: `Generated Recipe ${i + 1}`,
      ingredients: [{ name: "Flour", amount: 200, unit: Unit.G }],
      prepTimeMinutes: 15,
      prepSteps: "1. Mix ingredients\n2. Cook until done",
      cost: 5.0,
      difficulty: Difficulty.EASY,
      dietaryTags: ["vegan"],
      allergens: ["gluten"],
      servings: 2,
    }));
  }
}
