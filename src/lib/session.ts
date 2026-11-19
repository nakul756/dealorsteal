import "server-only";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb, schema } from "@/db";

/** Returns the signed-in user's row, or null. Verifies the JWT's user still exists. */
export async function getCurrentUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await getDb().query.users.findFirst({ where: eq(schema.users.id, id) });
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, image: user.image, provider: user.provider };
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
