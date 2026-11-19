import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`);

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // Null for accounts created through Google.
  passwordHash: text("password_hash"),
  phone: text("phone"),
  image: text("image"),
  provider: text("provider", { enum: ["credentials", "google"] }).notNull().default("credentials"),
  createdAt: createdAt(),
});

export const favourites = sqliteTable(
  "favourites",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("favourites_user_listing").on(t.userId, t.listingId)],
);

export const viewings = sqliteTable(
  "viewings",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id").notNull(),
    slot: text("slot").notNull(),
    note: text("note"),
    status: text("status", { enum: ["requested", "confirmed", "cancelled"] }).notNull().default("requested"),
    createdAt: createdAt(),
  },
  (t) => [index("viewings_user").on(t.userId)],
);

export const offers = sqliteTable(
  "offers",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listingId: text("listing_id").notNull(),
    amount: integer("amount").notNull(),
    message: text("message"),
    status: text("status", { enum: ["submitted", "countered", "accepted", "declined"] }).notNull().default("submitted"),
    createdAt: createdAt(),
  },
  (t) => [index("offers_user").on(t.userId)],
);

export type User = typeof users.$inferSelect;
export type Viewing = typeof viewings.$inferSelect;
export type Offer = typeof offers.$inferSelect;
