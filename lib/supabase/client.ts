// lib/supabase/client.ts — Client Supabase côté navigateur (Client Components).
// Utilise createBrowserClient de @supabase/ssr qui gère automatiquement
// la synchronisation des cookies de session entre le navigateur et le serveur.
// À utiliser uniquement dans les composants marqués 'use client'.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    // NEXT_PUBLIC_ : ces variables sont exposées au navigateur (pas de données sensibles)
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
