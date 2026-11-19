import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCurrentUser } from "@/lib/session";

// GET → { ids: string[] } of the signed-in user's saved listings.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ ids: [] }, { status: 401 });
  const rows = await getDb()
    .select({ listingId: schema.favourites.listingId })
    .from(schema.favourites)
    .where(eq(schema.favourites.userId, user.id));
  return Response.json({ ids: rows.map((r) => r.listingId) });
}
