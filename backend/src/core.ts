import postgres from "postgres";
import { IUsersService, UsersRepository, UsersService } from "@api/users";

// Core is our main entry point. It defines the services and features our application provides.
export type Core = {
  UsersService: IUsersService;
};

export function NewCore(): Core {
  const db = getDatabase();

  const usersRepository = new UsersRepository(db);

  return {
    UsersService: new UsersService(usersRepository),
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
