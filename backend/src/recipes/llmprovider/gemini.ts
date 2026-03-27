import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { InternalError } from "@api/helpers/errors";
import type { CreateRecipeRequest, ILLMProvider } from "@api/recipes/recipes";
import { createRecipeRequestSchema } from "@api/recipes/recipes";

const generatedRecipesSchema = z.array(createRecipeRequestSchema);

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

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: generatedRecipesSchema.toJSONSchema(),
        },
      });

      const text = response.text;
      if (!text) {
        throw new InternalError("LLM provider returned empty response");
      }

      const parsed = generatedRecipesSchema.safeParse(JSON.parse(text));
      if (parsed.error) {
        throw new InternalError(`LLM provider returned invalid response: ${parsed.error.message}`);
      }

      return parsed.data;
    } catch (err) {
      throw new InternalError(`Failed to generate recipes from LLM provider: ${err}`);
    }
  }
}
