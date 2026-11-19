import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

export const DB_FILE = path.join(process.cwd(), "data", "app.db");

type DB = BetterSQLite3Database<typeof schema>;

// Reuse one connection across hot reloads in dev.
const g = globalThis as unknown as { __dosDb?: DB };

function connect(): DB {
  mkdirSync(path.dirname(DB_FILE), { recursive: true });
  const sqlite = new Database(DB_FILE);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  // Idempotent: applies any pending migrations so a fresh checkout works without a manual step.
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return db;
}

export function getDb(): DB {
  g.__dosDb ??= connect();
  return g.__dosDb;
}

export { schema };
