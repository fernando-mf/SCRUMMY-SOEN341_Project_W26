import postgres from "postgres";

const connectionString = process.env.DATABASE_URL ?? "postgres://dev:dev@localhost:5432/mealmajor";
export const db = postgres(connectionString);

export async function PurgeDatabase() {
  const res = await db`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename != 'migrations'
      `;

  const tables = res.map((r) => `"${r.tablename}"`).join(", ");
  if (tables.length) {
    await db.unsafe(`TRUNCATE ${tables} CASCADE`);
  }
}
