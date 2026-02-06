import bcrypt from "bcrypt";
import { z } from "zod";
import { AuthenticationError, InvalidParamsError, NotFoundError } from "@api/helpers/errors";
import { signToken } from "@api/helpers/jwt";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dietPreferences: string[];
  allergies: string[];
};

export type UserInternal = User & {
  passwordHash: string;
};

export type AuthInfo = {
  id: number;
  email: string;
  passwordHash: string;
};

export type LoginResponse = {
  token: string;
  expires_in: number;
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
  Login(request: LoginRequest): Promise<LoginResponse>;
  Update(userID: number, request: UpdateUserRequest): Promise<void>;
  Get(userID: number): Promise<User>;
}

export interface IUsersRepository {
  Create(user: Omit<User, "id">): Promise<UserInternal>;
  Update(userID: number, user: User): Promise<void>;
  Get(userID: number): Promise<User>;
  GetAuthInfo(userID: number): Promise<AuthInfo>;
  GetAuthInfoByEmail(email: string): Promise<AuthInfo>;
}

export class UsersService implements IUsersService {
  constructor(private repository: IUsersRepository) {}

  async Create(req: CreateUserRequest): Promise<User> {
    const validation = createUserRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const passwordHash = await bcrypt.hash(req.password, 12);

    const user: Omit<UserInternal, "id"> = {
      firstName: req.firstName,
      lastName: req.lastName,
      email: req.email,
      passwordHash,
      dietPreferences: [],
      allergies: [],
    };

    return this.repository.Create(user);
  }

  async Login(req: LoginRequest): Promise<LoginResponse> {
    const validation = loginRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    let authInfo: AuthInfo;
    try {
      authInfo = await this.repository.GetAuthInfoByEmail(req.email);
    } catch (err) {
      if (err instanceof NotFoundError) {
        throw new AuthenticationError("wrong email or password");
      }

      throw err;
    }

    const isValid = await bcrypt.compare(req.password, authInfo.passwordHash);
    if (!isValid) {
      throw new AuthenticationError("wrong email or password");
    }

    const token = signToken({
      sub: authInfo.id,
      email: authInfo.email,
    });

    return {
      token,
      expires_in: 3600,
    };
  }

  async Update(userID: number, req: UpdateUserRequest): Promise<void> {
    const validation = updateUserRequestSchema.safeParse(req);
    if (validation.error) {
      throw InvalidParamsError.FromZodError(validation.error);
    }

    const currentUser = await this.repository.Get(userID);

    const updatedUser: User = {
      id: currentUser.id,
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
