// Server Actions pour la page /account — gestion du profil utilisateur.
// 'use server' : s'exécutent côté serveur, appelées depuis les formulaires de la page compte.
'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// updateProfile : met à jour le nom complet de l'utilisateur dans la table profiles.
// Utilise revalidatePath pour forcer le re-rendu de /account après la mise à jour.
export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get('fullName') || '').trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Sécurité : vérifie que l'utilisateur est bien connecté avant de modifier ses données
  if (!user) redirect('/login');

  // Met à jour uniquement la ligne correspondant à l'utilisateur (RLS garantit l'isolation)
  await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);

  // Invalide le cache de /account pour afficher le nouveau nom immédiatement
  revalidatePath('/account');
}

// changePassword : change le mot de passe via Supabase Auth.
// Retourne { error } ou { ok: true } — utilisé par un formulaire client pour afficher le résultat.
export async function changePassword(formData: FormData) {
  const newPassword = String(formData.get('newPassword') || '');
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return { ok: true };
}
