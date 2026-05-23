// Server Actions d'authentification — connexion, inscription, déconnexion.
// 'use server' : toutes les fonctions s'exécutent côté serveur via Supabase Auth.
'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// login : authentifie l'utilisateur avec email + mot de passe via Supabase Auth.
// En cas d'erreur : redirige vers /login avec le message d'erreur en query param.
// En cas de succès : invalide le cache du layout racine (revalide Header) et redirige.
export async function login(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  // next : URL de redirection après connexion (ex: /dashboard si l'utilisateur était bloqué)
  const next = String(formData.get('next') || '/');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return redirect(`/login?error=${encodeURIComponent(error.message)}`);

  // revalidatePath : force Next.js à re-rendre le layout racine pour mettre à jour
  // le Header (afficher "Mon compte" / "Déconnexion" au lieu de "Mon compte" seul)
  revalidatePath('/', 'layout');
  redirect(next);
}

// signup : crée un nouveau compte utilisateur via Supabase Auth.
// Le trigger Supabase handle_new_user() crée automatiquement un profil dans la table profiles.
export async function signup(formData: FormData) {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('fullName') || '');

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }, // Métadonnée transmise au trigger
  });

  if (error) return redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  revalidatePath('/', 'layout');
  redirect('/');
}

// logout : déconnecte l'utilisateur (invalide la session Supabase + supprime les cookies).
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
