import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { InternalError } from "@api/helpers/errors";
import type { CreateRecipeRequest, ILLMProvider } from "@api/recipes/recipes";
import { createRecipeRequestSchema, Difficulty, Unit } from "@api/recipes/recipes";

const generatedRecipesSchema = z.array(createRecipeRequestSchema);
const generatedRecipesJsonSchema = z.toJSONSchema(generatedRecipesSchema);
const GENERATION_TIMEOUT_MS = 9000;
const MAX_RETRY_ATTEMPTS = 0;
const RETRY_BASE_DELAY_MS = 600;

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function isRetryableProviderError(err: unknown): boolean {
  const maybeError = err as { status?: unknown; statusCode?: unknown; code?: unknown };
  const numericStatus = Number(maybeError?.status ?? maybeError?.statusCode);

  if (numericStatus === 503 || numericStatus === 429) {
    return true;
  }

  const codeText = String(maybeError?.code?.toString() ?? "").toLowerCase();
  if (codeText === "unavailable" || codeText === "resource_exhausted") {
    return true;
  }

  const message = getErrorMessage(err).toLowerCase();
  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildFallbackDrafts(rawIngredients: string[], count: number): CreateRecipeRequest[] {
  const normalized = [...new Set(rawIngredients.map((item) => item.trim().toLowerCase()).filter(Boolean))];
  const safeIngredients = normalized.length ? normalized : ["tomato", "onion"];
  const limitedCount = Math.max(1, Math.min(count, 3));

  return Array.from({ length: limitedCount }, (_, index) => {
    const rotated = safeIngredients.map((_, i) => safeIngredients[(i + index) % safeIngredients.length]);
    const core = rotated.slice(0, Math.min(5, rotated.length));
    const primary = toTitleCase(core[0] || "Pantry");

    return {
      name: `${primary} Quick Skillet ${index + 1}`,
      ingredients: core.map((name) => ({
        name: toTitleCase(name),
        amount: 1,
        unit: Unit.CUP,
      })),
      prepTimeMinutes: 20,
      prepSteps:
        "1. Prep all ingredients and season lightly with salt and pepper.\n" +
        "2. Cook ingredients in a pan with oil until tender and aromatic.\n" +
        "3. Adjust seasoning, serve warm, and customize toppings as desired.",
      cost: 8,
      difficulty: Difficulty.EASY,
      dietaryTags: ["customizable"],
      allergens: [],
      servings: 2,
    };
  });
}

export class GeminiLLMProvider implements ILLMProvider {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new InternalError("GEMINI_API_KEY is not set");
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  async GenerateRecipes(ingredients: string[], count: number, exclusions: string[]): Promise<CreateRecipeRequest[]> {
    const ingredientList = ingredients.join(", ");

    const exclusionLine =
      exclusions.length > 0 ? `Do NOT generate any of the following recipes: ${exclusions.join(", ")}.` : "";

    const prompt = `
Generate at most ${count} recipe(s) using some or all of the following ingredients: ${ingredientList}.

  Return ONLY valid JSON. No markdown. No code fences.
  If the ingredient list is too incoherent or unrealistic for practical cooking, return an empty array [].
  Do not force bizarre or novelty combinations just to produce output.

For each recipe:
- Use realistic quantities and units (g, ml, tbsp, tsp, cup, cloves)
- Assign a difficulty: "easy", "medium", or "hard"
- Estimate prep time in minutes
- Estimate cost as a non-negative number (USD)
- List any allergens present
- List applicable dietary tags (e.g. "vegan", "gluten-free")
- Specify the number of servings
- Write clear, numbered prep steps using markdown formatting for lists and emphasis. Each step should be in a new line, use newline characters \\n.

Additional common pantry ingredients needed to complete the recipe should be included in the recipe steps, but do not need to be listed in the ingredients.
${exclusionLine}`;

    for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await Promise.race([
          this.ai.models.generateContent({
            model: "gemini-3.1-flash-lite-preview",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseJsonSchema: generatedRecipesJsonSchema,
            },
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new InternalError("LLM generation timed out")), GENERATION_TIMEOUT_MS);
          }),
        ]);

        const text = response.text;
        if (!text) {
          throw new InternalError("LLM provider returned empty response");
        }

        let rawJson: unknown;
        try {
          rawJson = JSON.parse(text);
        } catch {
          throw new InternalError("LLM provider returned non-JSON output");
        }

        const directParsed = generatedRecipesSchema.safeParse(rawJson);
        if (directParsed.success) {
          return directParsed.data.slice(0, count);
        }

        const wrappedRecipes =
          rawJson && typeof rawJson === "object" && Array.isArray((rawJson as Record<string, unknown>).recipes)
            ? (rawJson as Record<string, unknown>).recipes
            : null;

        if (wrappedRecipes) {
          const wrappedParsed = generatedRecipesSchema.safeParse(wrappedRecipes);
          if (wrappedParsed.success) {
            return wrappedParsed.data.slice(0, count);
          }
        }

        return buildFallbackDrafts(ingredients, count);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        if (errorMessage.toLowerCase().includes("timed out")) {
          return buildFallbackDrafts(ingredients, count);
        }

        if (isRetryableProviderError(err)) {
          if (attempt < MAX_RETRY_ATTEMPTS) {
            await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
            continue;
          }

          return buildFallbackDrafts(ingredients, count);
        }

        throw new InternalError(`Failed to generate recipes from LLM provider: ${errorMessage}`);
      }
    }

    return [];
  }
}
