// lib/supabase/server.ts — Clients Supabase côté serveur (Server Components, Server Actions).
// Deux clients disponibles selon les droits nécessaires :
//   - createClient()      : client anon, limité par les politiques RLS → pour les opérations utilisateur
//   - createAdminClient() : client service_role, contourne RLS → UNIQUEMENT pour les opérations admin sécurisées
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// createClient : crée un client Supabase SSR qui lit/écrit les cookies de session Next.js.
// Doit être appelé dans un contexte async (Server Component ou Server Action).
export async function createClient() {
  // Accès au store de cookies Next.js (lecture de la session utilisateur)
  const cookieStore = await cookies();

  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof cookieStore.set>[2];
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Clé anon : respecte les politiques RLS
    {
      cookies: {
        // getAll : fournit tous les cookies à Supabase pour reconstruire la session
        getAll() {
          return cookieStore.getAll();
        },
        // setAll : Supabase appelle cette méthode pour rafraîchir les tokens de session.
        // Le try/catch est intentionnel : dans un Server Component (lecture seule),
        // l'écriture de cookies est bloquée — c'est le middleware qui s'en charge.
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component: cookies are read-only — middleware refreshes them.
          }
        },
      },
    },
  );
}

import { createClient as createAdminSb } from "@supabase/supabase-js";

// createAdminClient : client avec la clé service_role — contourne TOUTES les politiques RLS.
// À utiliser uniquement dans des Server Actions protégées (ex: webhook Stripe, opérations admin).
// JAMAIS exposé côté client : SUPABASE_SERVICE_ROLE_KEY n'est pas préfixée NEXT_PUBLIC_.
export function createAdminClient() {
  return createAdminSb(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clé secrète — jamais dans le bundle navigateur
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
