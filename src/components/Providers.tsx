"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { AuthGateProvider } from "./auth/AuthGate";
import { FavouritesProvider } from "./auth/Favourites";

// The session is read on the client so every public page stays in the static shell.
// Server actions and route handlers re-check the session themselves.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthGateProvider>
        <FavouritesProvider>{children}</FavouritesProvider>
      </AuthGateProvider>
    </SessionProvider>
  );
}
