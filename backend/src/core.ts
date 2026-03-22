import postgres from "postgres";
import { GeminiLLMProvider, IRecipesService, MockLLMProvider, RecipesRepository, RecipesService } from "@api/recipes";
import { IUsersService, UsersRepository, UsersService } from "@api/users";

// Core is our main entry point. It defines the services and features our application provides.
export type Core = {
  UsersService: IUsersService;
  RecipesService: IRecipesService;
};

export function NewCore(): Core {
  const db = getDatabase();

  const usersRepository = new UsersRepository(db);
  const recipesRepository = new RecipesRepository(db);

  const llmProvider =
    process.env.USE_MOCK_LLM === "true" ? new MockLLMProvider() : new GeminiLLMProvider(process.env.GEMINI_API_KEY!);

  return {
    UsersService: new UsersService(usersRepository),
    RecipesService: new RecipesService(recipesRepository, llmProvider),
  };
}

function getDatabase(): postgres.Sql {
  const connectionString = process.env.DATABASE_URL!;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  return postgres(connectionString);
}
