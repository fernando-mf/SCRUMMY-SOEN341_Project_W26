import { neon, Pool } from "@neondatabase/serverless";
import { UsersRepository, UsersService } from "@api/users";

export function NewCore() {
  const db = neon(process.env.DATABASE_URL!, { fullResults: true });

  const usersRepository = new UsersRepository(db);

  return {
    UsersService: new UsersService(usersRepository),
  };
}

export type Core = ReturnType<typeof NewCore>;
