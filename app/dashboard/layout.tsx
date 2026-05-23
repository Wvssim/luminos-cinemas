// Layout du Dashboard Administrateur — route /dashboard/*.
// Server Component : vérifie l'authentification et le rôle admin côté serveur
// AVANT de rendre les pages enfants. Tout accès non autorisé est bloqué ici.
// force-dynamic : pas de cache — on vérifie la session à chaque requête.
import DashNav from '@/components/DashNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Étape 1 : vérifier qu'un utilisateur est connecté
  // getUser() relit les cookies de session et valide le JWT côté Supabase
  const { data: { user } } = await supabase.auth.getUser();

  // Pas de session → redirection vers /login avec paramètre next pour revenir après connexion
  if (!user) redirect('/login?next=/dashboard');

  // Étape 2 : vérifier que l'utilisateur a le rôle 'admin' dans la table profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role,email')
    .eq('id', user.id)
    .single();

  // Rôle insuffisant → redirection vers l'accueil
  if (profile?.role !== 'admin') redirect('/');

  return (
    <div className="dash">
      {/* Barre de navigation latérale du dashboard avec l'email de l'admin */}
      <DashNav email={profile?.email || ''} />

      {/* Zone de contenu principal — injecte la page enfant (/dashboard/films, etc.) */}
      <main className="dash__main">{children}</main>
    </div>
  );
}
