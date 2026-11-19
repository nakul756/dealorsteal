// Applies the SQL migrations in ./drizzle to data/app.db.
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const file = path.join(process.cwd(), "data", "app.db");
mkdirSync(path.dirname(file), { recursive: true });
const sqlite = new Database(file);
sqlite.pragma("foreign_keys = ON");
migrate(drizzle(sqlite), { migrationsFolder: path.join(process.cwd(), "drizzle") });
sqlite.close();
console.log(`✓ Migrated ${path.relative(process.cwd(), file)}`);
