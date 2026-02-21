import postgres from "postgres";
import { IUsersService, UsersRepository, UsersService } from "@api/users";
import { IRecipesService, RecipesRepository, RecipesService } from "@api/recipes";

// Core is our main entry point. It defines the services and features our application provides.
export type Core = {
  UsersService: IUsersService;
  RecipesService: IRecipesService;
};

export function NewCore(): Core {
  const db = getDatabase();

  const usersRepository = new UsersRepository(db);
  const recipesRepository = new RecipesRepository(db);

  return {
    UsersService: new UsersService(usersRepository),
    RecipesService: new RecipesService(recipesRepository),
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
