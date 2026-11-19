import { z } from "zod";
import { listingById } from "./data";

export const VIEWING_SLOTS = ["Sat 10:00", "Sat 14:30", "Sun 11:00", "Mon 18:00"] as const;

const email = z.string().trim().toLowerCase().email("Enter a valid email address");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(200),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email,
  password: z.string().min(8, "Use at least 8 characters").max(200),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Use digits, spaces and + only")
    .optional()
    .transform((v) => v || undefined),
});

export const profileSchema = signUpSchema.pick({ name: true, phone: true });

const listingId = z.string().refine((id) => Boolean(listingById(id)), "Unknown property");

export const favouriteSchema = z.object({ listingId, saved: z.boolean() });

export const viewingSchema = z.object({
  listingId,
  slot: z.enum(VIEWING_SLOTS, { message: "Pick a time slot" }),
  note: z.string().trim().max(500).optional().transform((v) => v || undefined),
});

export const offerSchema = z
  .object({
    listingId,
    amount: z.coerce.number().int("Enter a whole number").positive("Enter an amount"),
    message: z.string().trim().max(1000).optional().transform((v) => v || undefined),
  })
  .superRefine((o, ctx) => {
    const l = listingById(o.listingId);
    if (!l) return;
    if (o.amount < l.price * 0.5 || o.amount > l.price * 1.5)
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Offer must be within 50% of the asking price" });
  });

export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
}
