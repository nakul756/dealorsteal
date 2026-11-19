"use server";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/session";
import {
  favouriteSchema,
  fieldErrors,
  offerSchema,
  profileSchema,
  signUpSchema,
  viewingSchema,
  type FieldErrors,
} from "@/lib/validation";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fields?: FieldErrors; unauthenticated?: boolean };

const UNAUTH = { ok: false, error: "Please sign in to continue.", unauthenticated: true } as const;

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) };
  const { name, email, password, phone } = parsed.data;
  const db = getDb();
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing)
    return { ok: false, error: "An account with this email already exists.", fields: { email: "Already registered — sign in instead" } };
  db.insert(schema.users)
    .values({ name, email, phone, passwordHash: await bcrypt.hash(password, 10), provider: "credentials" })
    .run();
  return { ok: true };
}

export async function setFavouriteAction(input: unknown): Promise<ActionResult<{ saved: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return UNAUTH;
  const parsed = favouriteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  const { listingId, saved } = parsed.data;
  const db = getDb();
  if (saved) {
    db.insert(schema.favourites).values({ userId: user.id, listingId }).onConflictDoNothing().run();
  } else {
    db.delete(schema.favourites)
      .where(and(eq(schema.favourites.userId, user.id), eq(schema.favourites.listingId, listingId)))
      .run();
  }
  return { ok: true, data: { saved } };
}

export async function bookViewingAction(input: unknown): Promise<ActionResult<{ slot: string }>> {
  const user = await getCurrentUser();
  if (!user) return UNAUTH;
  const parsed = viewingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) };
  getDb().insert(schema.viewings).values({ userId: user.id, ...parsed.data }).run();
  return { ok: true, data: { slot: parsed.data.slot } };
}

export async function makeOfferAction(input: unknown): Promise<ActionResult<{ amount: number }>> {
  const user = await getCurrentUser();
  if (!user) return UNAUTH;
  const parsed = offerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) };
  getDb().insert(schema.offers).values({ userId: user.id, ...parsed.data }).run();
  return { ok: true, data: { amount: parsed.data.amount } };
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return UNAUTH;
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) };
  getDb()
    .update(schema.users)
    .set({ name: parsed.data.name, phone: parsed.data.phone ?? null })
    .where(eq(schema.users.id, user.id))
    .run();
  return { ok: true };
}

export async function cancelViewingAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return UNAUTH;
  if (typeof id !== "string") return { ok: false, error: "Invalid request." };
  getDb()
    .update(schema.viewings)
    .set({ status: "cancelled" })
    .where(and(eq(schema.viewings.id, id), eq(schema.viewings.userId, user.id)))
    .run();
  return { ok: true };
}
