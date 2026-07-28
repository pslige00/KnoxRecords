// A copy of lib/db/index.ts without the `server-only` guard, for use only by
// the standalone seed script (lib/db/seed.ts), which runs under plain Node
// via tsx rather than inside the Next.js server bundle.
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
