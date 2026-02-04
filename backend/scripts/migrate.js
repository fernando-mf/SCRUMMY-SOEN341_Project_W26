const { migrate } = require("postgres-migrations");

// https://www.npmjs.com/package/postgres-migrations#api
async function main() {
  const dbConfig = {
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    defaultDatabase: "postgres",
  };

  const res = await migrate(dbConfig, "integration/migrations");
  console.log(`${res.length} migrations applied`);
}

main();
