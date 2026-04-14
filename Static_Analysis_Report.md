# Static Analysis with eslint

After running eslint for the first time, using some of the recommended rules defined [here](https://typescript-eslint.io/rules/?=recommended).

We got the following results:

```sh
✖ 96 problems (41 errors, 55 warnings)
```

See full payload in [./docs/eslint-report-1.log](/docs/eslint-report-1.log). 

## Error categories

Some of the major problems raised in the first report were:

1. Unsafe `any` usage

Some code segments were using `any` as type. This disables Typescript type-checking system, potentially leading developers to make false assumptions about variable types. See example:

```ts
// incorrect
const userToken: any = req.auth; // we assume req.auth is a valid object, what if it's null or a string?
const userId = userToken.sub;    // this is where it breaks, we might get `null pointer exception` or `unknown property "sub" in type string`

// correct
const userToken: unknown = req.auth;  // we don't know what we received, so flag it as unknown
validateToken(userToken);             // ensure the token respects the expected format
const userId: number = userToken.sub; // at this point, the token is valid and the "sub" property is typed as `number`
```

2. Unused variables and imports:

Not as bad as the previous error, but it's a good practice to keep things organized to keep things readable.

3. Async functions without `await`

Async functions without `await` return a promise, instead of a value. Example:

```ts
// incorrect
const user = FetchUserProfile(userId); // this function is async (it calls the db), without await it returns a Promise in pending state.
console.log(user.firstName); // there's no `firstName` attribute in a promise object, this throws as "unknown property" error.

// correct
const user = await FetchUserProfile(userId); // now we're waiting for the db call to complete, `user` receives the user profile.
console.log(user.firstName); // this works as expected
```

4. Invalid enum comparisons

This is a warning rather than an error. It forces us to do comparisons between same enum types. 

```ts
// incorrect
if (err.code === PostgresErrorCode.UniqueViolation) { // technically not a problem because we made sure the values were matching, but typescript forces us to cast `code`
      throw new ConflictError("email");
}

// correct - eslint recommendation
if ((err.code as PostgresErrorCode) === PostgresErrorCode.UniqueViolation) { // now `err.code` and `PostgresErrorCode.UniqueViolation` share the same type
      throw new ConflictError("email");
}
```

5. Incorrect null checks / guards

This is another warning, but it can lead to some annoying bugs. 

```ts
// incorrect
updateUserAlias(req.alias || 'default'); // if user explicitly wants no alias (empty string), this code will still assign "default". In JS, the || operator moves to the next segment if the first one is considered falsey (empty string, false, 0, null, undefined).

// correct
updateUserAlias(req.alias ?? 'default'); // the ?? operator only moves to the next segment if the first one is `null` or `undefined`, in this case we respect the user preference.
```

---

Note: to keep things simple, some examples are unrelated to our codebase and others are simplifications of the changes made to fix the lint issues.

## Fixing eslint errors

Some errors were fixed automatically by `eslint` using `eslint src --fix`. Others, required manual changes.

After fixing all eslint problems, the tool reported no additional issues. An `echo $?` (prints last command exit code) returned `0`. Meaning `eslint` completed successfully.

```sh
$ npm run lint

> mealmajor-api@1.0.0 lint
> eslint src

$ echo $?
0
```

## Continuous Integration

An additional `lint` step was added to our "Backend CI" workflow.

```yaml
- run: npm run lint
```

Ensuring future pull requests get checked automatically on github actions. With this change, our workflow now runs the following steps:

```yaml
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration:docker
```

This setup gives us a solid CI pipeline that suggests improvements and helps us detect problems before attempting to push our code to production.