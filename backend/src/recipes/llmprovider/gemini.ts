import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { InternalError } from "@api/helpers/errors";
import type { CreateRecipeRequest, ILLMProvider } from "@api/recipes/recipes";
import { createRecipeRequestSchema, Difficulty, Unit } from "@api/recipes/recipes";

const generatedRecipesSchema = z.array(createRecipeRequestSchema);
const unitValues = new Set<string>(Object.values(Unit));
const difficultyValues = new Set<string>(Object.values(Difficulty));
const GENERATION_TIMEOUT_MS = 9000;
const MAX_RETRY_ATTEMPTS = 0;
const RETRY_BASE_DELAY_MS = 600;

const sweetSpreadTerms = [
  "nutella",
  "chocolate spread",
  "jam",
  "jelly",
  "peanut butter",
  "honey",
  "maple syrup",
];

const savorySauceTerms = [
  "bbq sauce",
  "barbecue sauce",
  "soy sauce",
  "fish sauce",
  "mustard",
  "hot sauce",
  "sriracha",
  "ketchup",
  "mayo",
];

const savorySpiceTerms = [
  "paprika",
  "cumin",
  "garam masala",
  "turmeric",
  "chili powder",
  "curry powder",
  "oregano",
  "thyme",
  "rosemary",
];

const bridgeIngredientTerms = [
  "chicken",
  "beef",
  "pork",
  "tofu",
  "egg",
  "rice",
  "pasta",
  "potato",
  "onion",
  "garlic",
  "tomato",
  "cheese",
  "milk",
  "cream",
  "banana",
  "strawberry",
];

function includesAny(ingredients: string[], terms: string[]): boolean {
  return ingredients.some((ingredient) =>
    terms.some((term) => ingredient.includes(term) || term.includes(ingredient)),
  );
}

function hasVeryLowCoherence(ingredients: string[]): boolean {
  const normalized = ingredients
    .map((ingredient) => ingredient.trim().toLowerCase())
    .filter(Boolean);

  if (normalized.length < 3) return false;

  const hasSweetSpread = includesAny(normalized, sweetSpreadTerms);
  const hasSavorySauce = includesAny(normalized, savorySauceTerms);
  const hasSavorySpice = includesAny(normalized, savorySpiceTerms);
  const hasBridge = includesAny(normalized, bridgeIngredientTerms);

  // Strong conflict: sweet spread + savory sauce + savory spice with no bridge ingredient.
  if (hasSweetSpread && hasSavorySauce && hasSavorySpice && !hasBridge) {
    return true;
  }

  // Weak conflict escalates for small/random sets.
  if (normalized.length <= 4 && hasSweetSpread && hasSavorySauce && !hasBridge) {
    return true;
  }

  return false;
}

function parseAmountToken(rawAmount: unknown): number {
  if (typeof rawAmount === "number" && rawAmount > 0) return rawAmount;
  if (typeof rawAmount !== "string") return 1;

  const value = rawAmount.trim();
  const fractionMatch = value.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (denominator > 0) return numerator / denominator;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
}

function normalizeUnit(rawUnit: unknown): Unit {
  const unit = String(rawUnit || "").trim().toLowerCase();
  return unitValues.has(unit) ? (unit as Unit) : Unit.G;
}

function parseIngredient(rawIngredient: unknown): { name: string; amount: number; unit: Unit } | null {
  if (!rawIngredient) return null;

  if (typeof rawIngredient === "object") {
    const ingredient = rawIngredient as Record<string, unknown>;
    const name = String(ingredient.name || "").trim();
    if (!name) return null;

    return {
      name,
      amount: parseAmountToken(ingredient.amount),
      unit: normalizeUnit(ingredient.unit),
    };
  }

  const asString = String(rawIngredient).trim();
  if (!asString) return null;

  const match = asString.match(/^(\d+(?:\.\d+)?|\d+\/\d+)?\s*(g|ml|tbsp|tsp|cup|cloves)?\s*(.*)$/i);
  if (!match) {
    return { name: asString, amount: 1, unit: Unit.G };
  }

  const [, amountToken, unitToken, nameToken] = match;
  const fallbackName = asString.replace(/^(\d+(?:\.\d+)?|\d+\/\d+)\s*/, "").trim();
  const name = (nameToken || fallbackName || asString).trim();
  if (!name) return null;

  return {
    name,
    amount: parseAmountToken(amountToken),
    unit: normalizeUnit(unitToken),
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toPositiveInt(rawValue: unknown, fallback: number): number {
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) return fallback;
  const next = Math.floor(numeric);
  return next > 0 ? next : fallback;
}

function toCost(rawValue: unknown): number {
  if (typeof rawValue === "number" && rawValue >= 0) return rawValue;

  const text = String(rawValue || "").trim().toLowerCase();
  if (!text) return 10;
  if (text === "budget") return 5;
  if (text === "moderate") return 15;
  if (text === "expensive") return 25;

  const numeric = Number(text);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : 10;
}

function normalizeDifficulty(rawValue: unknown): Difficulty {
  const text = String(rawValue || "").trim().toLowerCase();
  return difficultyValues.has(text) ? (text as Difficulty) : Difficulty.MEDIUM;
}

function normalizePrepSteps(rawValue: unknown): string {
  if (Array.isArray(rawValue)) {
    const lines = rawValue.map((line) => String(line).trim()).filter(Boolean);
    return lines.join("\n");
  }

  const text = String(rawValue || "").trim();
  return text || "1. Prepare ingredients.\n2. Cook until done.\n3. Serve.";
}

function extractJsonValue(rawText: string): unknown {
  try {
    return JSON.parse(rawText);
  } catch {
    const jsonBlock = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/)?.[0];
    if (!jsonBlock) {
      throw new InternalError("LLM provider returned non-JSON output");
    }
    return JSON.parse(jsonBlock);
  }
}

function getRecipeCandidates(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];

  const record = raw as Record<string, unknown>;
  if (Array.isArray(record.recipes)) return record.recipes;
  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.results)) return record.results;
  return [];
}

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

  const codeText = String(maybeError?.code ?? "").toLowerCase();
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

function coerceRecipe(rawRecipe: unknown, index: number): CreateRecipeRequest {
  const recipe = (rawRecipe || {}) as Record<string, unknown>;

  const ingredientSource = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : normalizeStringArray(recipe.ingredients);

  const ingredients = ingredientSource
    .map(parseIngredient)
    .filter((ingredient): ingredient is NonNullable<typeof ingredient> => Boolean(ingredient));

  return {
    name: String(recipe.name || recipe.title || `Generated Recipe ${index + 1}`).trim(),
    ingredients: ingredients.length ? ingredients : [{ name: "water", amount: 100, unit: Unit.ML }],
    prepTimeMinutes: toPositiveInt(recipe.prepTimeMinutes, 30),
    prepSteps: normalizePrepSteps(recipe.prepSteps ?? recipe.instructions),
    cost: toCost(recipe.cost),
    difficulty: normalizeDifficulty(recipe.difficulty),
    dietaryTags: normalizeStringArray(recipe.dietaryTags),
    allergens: normalizeStringArray(recipe.allergens),
    servings: toPositiveInt(recipe.servings, 2),
  };
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
    if (hasVeryLowCoherence(ingredients)) {
      return [];
    }

    const ingredientList = ingredients.join(", ");

    const exclusionLine =
      exclusions.length > 0 ? `Do NOT generate any of the following recipes: ${exclusions.join(", ")}.` : "";

    const prompt = `
Generate at most ${count} recipe(s) using some or all of the following ingredients: ${ingredientList}.

  Return ONLY valid JSON. No markdown. No code fences.
  The response must be either an array of recipes or an object with a "recipes" array.
  Each recipe object must include exactly these keys:
  name, ingredients, prepTimeMinutes, prepSteps, cost, difficulty, dietaryTags, allergens, servings.
  Ingredients must be an array of objects with: name, amount, unit.
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
            },
          }),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("LLM generation timed out")), GENERATION_TIMEOUT_MS);
          }),
        ]);

        const text = response.text;
        if (!text) {
          throw new InternalError("LLM provider returned empty response");
        }

        const rawJson = extractJsonValue(text);
        const candidates = getRecipeCandidates(rawJson).slice(0, count);
        const normalized = candidates.map((recipe, index) => coerceRecipe(recipe, index));

        const parsed = generatedRecipesSchema.safeParse(normalized);
        if (parsed.error) {
          throw new InternalError(`LLM provider returned invalid response: ${parsed.error.message}`);
        }

        return parsed.data;
      } catch (err) {
        if (err instanceof Error && err.message === "LLM generation timed out") {
          return buildFallbackDrafts(ingredients, count);
        }

        if (isRetryableProviderError(err)) {
          if (attempt < MAX_RETRY_ATTEMPTS) {
            await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
            continue;
          }

          return buildFallbackDrafts(ingredients, count);
        }

        throw new InternalError(`Failed to generate recipes from LLM provider: ${err}`);
      }
    }

    return [];
  }
}
