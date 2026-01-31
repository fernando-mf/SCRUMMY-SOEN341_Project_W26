import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { UsersRepository, UsersService } from "@api/users";

export type Core = ReturnType<typeof NewCore>;

export function NewCore() {
  const db = getDatabase();

  const usersRepository = new UsersRepository(db);

  return {
    UsersService: new UsersService(usersRepository),
  };
}

function getDatabase(): NeonQueryFunction<false, true> {
  const connectionString = process.env.DATABASE_URL!;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  return neon(connectionString, { fullResults: true });
}
