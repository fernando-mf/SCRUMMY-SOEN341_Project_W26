# Backend (API)

```bash
cd api
npm install
cp .env.example .env  # Configure environment variables
npm run dev           # Start development server (http://localhost:3000)
```

**Available Scripts:**

- `npm run dev` - Start development server with hot reload
- `npm run dev:docker` - Runs the production build in a containerized development environment, useful for running integration tests locally
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm run test:integration` - Runs the integration tests, **this needs a running API and Database** otherwise tests are going to fail
- `npm run test:integration:docker` - Runs the integration tests suite in a containerized environment, this spins up its own local api and database.

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

    - `/helpers`: shared project utilities
        - `errors.ts`: custom application errors

    - `/{moduleName}`: core logic for a module e.g. user management
        - `/{moduleName}.ts`: interfaces and domain rules
        - `/postgres_repository.ts`: postgressql code
        - `/{thirdParty}_provider.ts`: other third parties' implementations

    - `core.ts`: single unit containing all application features

## Running Integration Tests

### Docker environment

- Run `npm run test:integration:docker` or `npm run test:integration:docker:Windows` (if you are on Windows).
- That will run the tests as well as their dependencies. Once the script completes, the results will be printed in the terminal.

### Local development

This option is useful for a quick feedback loop when writing integration tests.

1. In one terminal window run `npm run dev:docker`, it will run the API and the Database in docker.

2. In a different terminal window run `npm run test:integration`.

If you make changes to your integration tests, just repeat step 2 and check if the tests pass. This is much faster than going through docker every time tests are changed.

## Writing Integration Tests

1. First complete your task in `/src`
2. Start the app using docker `npm run dev:docker`
3. Write your test in `/integration/tests`, follow existing examples
4. In a different terminal, run your test with `npm run test:integration`
5. If the test fails and you have to change the source code (`/src`), stop the docker server and start it again (`npm run dev:docker`). Then run the tests `npm run test:integration`

**Updating snapshots**

Just add the flag `-- -u` to the `npm run test:integration` command. 

```sh
npm run test:integration -- -u
```

Some tests use vitest snapshots, if any of the tested models changes e.g. adding a new field to the `User` model, the test will fail. We have 2 options:
1. Failure is expected: update snapshots
2. Failure is unexpected: double check the code, maybe a bug was introduced