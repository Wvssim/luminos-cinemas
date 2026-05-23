// Server Actions pour la gestion des rôles utilisateurs dans le dashboard.
// 'use server' : s'exécute côté serveur avec le client anon (RLS) — les admins peuvent modifier les profils.
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// setRole : met à jour le rôle d'un utilisateur dans la table profiles.
// Si le profil n'existe pas encore (trigger handle_new_user non déclenché), le crée.
// Appelée depuis la page /dashboard/utilisateurs via DeleteButton avec window.confirm.
export async function setRole(id: string, role: 'admin' | 'user') {
  const supabase = await createClient();

  // Vérifie si un profil existe déjà pour cet utilisateur
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', id).single();

  if (!existing) {
    // Profil manquant : récupère les données Auth pour créer le profil manuellement
    // Cas rare — peut arriver si le trigger Supabase a échoué lors de l'inscription
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.id === id);
    if (user) {
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        role,
      });
    }
  } else {
    // Profil existant : mise à jour du rôle uniquement
    await supabase.from('profiles').update({ role }).eq('id', id);
  }

  // Invalide le cache de la page utilisateurs pour refléter immédiatement le nouveau rôle
  revalidatePath('/dashboard/utilisateurs');
}
