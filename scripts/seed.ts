// Seeds a demo account with a saved home, a viewing and an offer.
// Safe to re-run: the demo user's data is replaced each time.
import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../src/db/schema";

const file = path.join(process.cwd(), "data", "app.db");
mkdirSync(path.dirname(file), { recursive: true });
const sqlite = new Database(file);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });
migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

const DEMO = { name: "Demo Buyer", email: "demo@dealorsteal.ae", password: "demo1234", phone: "+971 50 123 4567" };

db.delete(schema.users).where(eq(schema.users.email, DEMO.email)).run(); // cascades

const [user] = db
  .insert(schema.users)
  .values({
    name: DEMO.name,
    email: DEMO.email,
    phone: DEMO.phone,
    passwordHash: bcrypt.hashSync(DEMO.password, 10),
    provider: "credentials",
  })
  .returning()
  .all();

db.insert(schema.favourites)
  .values([
    { userId: user.id, listingId: "jvc-garden-2br" },
    { userId: user.id, listingId: "hills-park-th" },
  ])
  .run();

db.insert(schema.viewings).values({ userId: user.id, listingId: "jvc-garden-2br", slot: "Sat 10:00", note: "Interested in the pool-view units." }).run();
db.insert(schema.offers).values({ userId: user.id, listingId: "marina-sky-2br", amount: 2_780_000, message: "Cash buyer, can close in 30 days." }).run();

sqlite.close();
console.log(`✓ Seeded demo account: ${DEMO.email} / ${DEMO.password}`);
