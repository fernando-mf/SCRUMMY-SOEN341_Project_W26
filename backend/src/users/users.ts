export interface IUsersService {
  // TODO: user creation
  CreateUser(user: User): Promise<User>;
}

export interface IUsersRepository {
  // TODO: user persistence (postgres)
  CreateUser(user: User): Promise<User>;
}

// TODO: define user type
export type User = {
  firstName: string;
  lastName: string;
  email: string;
};

// TODO: implement users service
export class UsersService implements IUsersService {
  constructor(private repository: IUsersRepository) {}

  CreateUser(user: User): Promise<User> {
    return this.repository.CreateUser(user);
  }
}
