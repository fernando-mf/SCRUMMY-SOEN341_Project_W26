import { z } from "zod";
import { InvalidParamsError } from "@api/helpers/errors";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  dietPreferences: string[];
  allergies: string[];
};

const createUserRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

const updateUserRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dietPreferences: z.array(z.string()),
  allergies: z.array(z.string()),
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export interface IUsersService {
  Create(request: CreateUserRequest): Promise<User>;
  Update(userID: number, request: UpdateUserRequest): Promise<void>;
  Get(userID: number): Promise<User>;
}

export interface IUsersRepository {
  Create(user: User): Promise<User>;
  Update(userID: number, user: User): Promise<void>;
  Get(userID: number): Promise<User>;
}

export class UsersService implements IUsersService {
  constructor(private repository: IUsersRepository) {}

  async Create(req: CreateUserRequest): Promise<User> {
    const validation = createUserRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }
    
    const user: User = {
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      dietPreferences: [],
      allergies: [],
    }

    return this.repository.Create(user);
  }

  async Update(userID: number, req: UpdateUserRequest): Promise<void> {
    const validation = updateUserRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const currentUser = await this.repository.Get(userID);

    const updatedUser: User = {
      email: currentUser.email,
      firstName: req.firstName,
      lastName: req.lastName,
      dietPreferences: req.dietPreferences,
      allergies: req.allergies,
    };

    await this.repository.Update(userID, updatedUser);
  }

  Get(userID: number): Promise<User> {
    return this.repository.Get(userID);
  }
}
