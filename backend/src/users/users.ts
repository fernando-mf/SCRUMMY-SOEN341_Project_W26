import { z } from "zod";
import { InvalidParamsError } from "@api/helpers/errors";
import bcrypt from "bcrypt";
import { signToken } from "@api/helpers/jwt";

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  dietPreferences: string[];
  allergies: string[];
}; 

const createUserRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  password: z.string().min(8), //could be changed to be more strict
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

const updateUserRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dietPreferences: z.array(z.string()),
  allergies: z.array(z.string()),
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export interface IUsersService {
  Create(request: CreateUserRequest): Promise<User>;
  Login(request: LoginRequest): Promise<{user: User; token: string}>;
  Update(userID: number, request: UpdateUserRequest): Promise<void>;
  Get(userID: number): Promise<User>;
}

export interface IUsersRepository {
  Create(user: User): Promise<User>;
  Update(userID: number, user: User): Promise<void>;
  Get(userID: number): Promise<User>;
  GetByEmail(email: string): Promise<User>;
}

export class UsersService implements IUsersService {
  constructor(private repository: IUsersRepository) {}

  async Create(req: CreateUserRequest): Promise<User> {
    const validation = createUserRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const passwordHash = await bcrypt.hash(req.password, 12);
    
    const user: User = {
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      passwordHash,
      dietPreferences: [],
      allergies: [],
    }

    return this.repository.Create(user);
  }

  async Login(req: LoginRequest): Promise<{user: User; token: string}>{
    const validation = loginRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    let user:User;
    try {
      user = await this.repository.GetByEmail(req.email);
    } catch {
      throw new InvalidParamsError({
        param: "email_or_password",
        description: "wrong email or password",
      });
    }

    const isValid = await bcrypt.compare(req.password, user.passwordHash);
    if (!isValid) {
      throw new InvalidParamsError({
        param: "email_or_password",
        description: "wrong email or password",
      });
    }

    const token = signToken({
      sub: user.email // should be id?
    })

    return {
      user: user,
      token,
    };
  }

  async Update(userID: number, req: UpdateUserRequest): Promise<void> {
    const validation = updateUserRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const currentUser = await this.repository.Get(userID);

    const updatedUser: User = {
      email: currentUser.email,
      passwordHash: currentUser.passwordHash,
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
