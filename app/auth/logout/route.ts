// Route API /auth/logout — Endpoint POST pour déconnecter l'utilisateur.
// Appelé par le formulaire POST dans Header.tsx (bouton "Déconnexion").
// Utilise POST (pas GET) pour éviter la déconnexion accidentelle via prefetch ou crawl.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  // signOut : invalide la session Supabase et supprime les cookies d'authentification
  await supabase.auth.signOut();
  // Redirige vers l'accueil après déconnexion (303 See Other — pattern PRG)
  return NextResponse.redirect(new URL('/', request.url));
}
