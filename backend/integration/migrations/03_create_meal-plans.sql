CREATE TABLE meal_plans (
    "id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "authorId" INT NOT NULL REFERENCES users("id"),
    "name" VARCHAR(255) NOT NULL,
    "weekNumber" INT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_plan_entries (
    "mealPlanId" INT NOT NULL REFERENCES meal_plans ("id") ON DELETE CASCADE,
    "recipeId" INT NOT NULL REFERENCES recipes ("id"),
    "dayOfWeek" VARCHAR(10) NOT NULL,
    "mealType" VARCHAR(10) NOT NULL,
    PRIMARY KEY ("mealPlanId", "recipeId")
);
