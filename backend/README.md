# Backend (API)

```bash
cd api
npm install
cp .env.example .env  # Configure environment variables
npm run dev           # Start development server (http://localhost:3000)
```

**Available Scripts:**

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build

## Project Structure

To keep our code organized we decided to implement a variant of [Clean Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures#clean-architecture). Our project has the following layers

### 1. Core

This is where we keep the business rules i.e. project / client requirements. This layer provides the logic needed to solve the problem. This layer has no knowledge of external dependencies such as databases, instead it uses interfaces to define the features needed to fulfill a task. 

For example, a user creation flow has the following steps:
- Validate user inputs
- Check for duplicates
- Write user to database
- Return successful response to client.

We now have a dependency on a database. In this layer we don't need to focus on which database to use or the SQL instructions needed to store a user, we can simply use the [Repository Pattern](https://www.geeksforgeeks.org/system-design/repository-design-pattern/) to define the features we need.

```ts
interface UsersRepository {
    SaveUser(user: User)
}
```
The implementation details will be coded in the Infra layer.

### 2. Infra

This layer contains implementations for the dependencies defined in the Core. In our previous example, we would provide a PostgresSQL implementation here. Some of the advantages of this pattern are:

- **Swapping implementations**: If we need to change db, for example to MySQL. We won't need to change the core logic. All we need to do is to provide a new MySQL implementation of `UsersRepository`.
- **Unit testing**: This is probably the best advantage, we can provide *mocked* implementations for testing. This allows us to test complex scenarios such as "On database duplicate error, return account existing error to the user" or a "database down" edge case.
- **Separation of concerns**: Domain logic and external dependency details are loosely coupled.

### 3. Presentation

This is the way of delivering the app to the user. In our case, we're using a HTTP API using express. But if needed, we could easily implement a CLI or even a desktop application.

## File / Folder organization

- `/src` : source code root

    - `/http`: http presentation layer
        - `index.ts`: express api setup
        - `routes.ts`: http routes

    - `/{moduleName}`: core logic for a module e.g. user management
        - `/{moduleName}.ts`: interfaces and domain rules
        - `/postgres_repository.ts`: postgressql code
        - `/{thirdParty}_provider.ts`: other third parties' implementations
        
    - `core.ts`: single unit containing all application features