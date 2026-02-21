CREATE TABLE recipes (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "authorID" INT NOT NULL REFERENCES users("id"),
    "prepTimeMinutes" INT NOT NULL,
    "prepSteps" TEXT NOT NULL,
    "cost" NUMERIC(10, 2) NOT NULL,
    "difficulty" VARCHAR(50) NOT NULL,
    "dietaryTags" VARCHAR(255) [] NOT NULL,
    "allergens" VARCHAR(255) [] NOT NULL,
    "servings" INT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipe_ingredients (
    "recipeID" INT NOT NULL REFERENCES recipes ("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "amount" NUMERIC(10, 2) NOT NULL,
    "unit" VARCHAR(10) NOT NULL,
    PRIMARY KEY ("recipeID", "name")
);