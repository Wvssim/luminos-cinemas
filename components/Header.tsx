// Composant Header — barre de navigation principale présente sur toutes les pages publiques.
// Server Component async : lit la session Supabase côté serveur pour afficher les liens conditionnels
// (Mon compte / Déconnexion / Dashboard admin) sans exposer la session au client.
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export default async function Header({
  active,
}: {
  // active : identifiant de la page courante — applique la classe "is-on" au lien correspondant
  active?: 'home' | 'prochainement' | 'salles' | 'programme' | 'reservation';
} = {}) {
  // Lecture de l'utilisateur connecté depuis les cookies de session SSR
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Vérifie le rôle admin dans la table profiles pour afficher le lien Dashboard
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = data?.role === 'admin';
  }

  // Helper : retourne les classes CSS du lien de nav avec état actif conditionnel
  const cls = (k: string) => `nav-link${active === k ? ' is-on' : ''}`;

  return (
    <header className="hd">
      {/* Logo — lien vers l'accueil */}
      <Link href="/" className="hd__logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Image
          src="/logo.png"
          alt="Lumière Cinémas"
          width={34}
          height={34}
          style={{ filter: 'invert(1) brightness(1.8)', objectFit: 'contain' }}
          priority
        />
        <b>LUMIÈRE</b><span>· cinémas</span>
      </Link>

      {/* Navigation principale */}
      <nav className="hd__nav">
        <Link href="/" className={`nav-link${active === 'home' ? ' is-on' : ''}`}>À l'affiche</Link>
        <Link href="/salles" className={`nav-link${active === 'salles' ? ' is-on' : ''}`}>Salles</Link>
        <Link href="/programme" className={`nav-link${active === 'programme' ? ' is-on' : ''}`}>Programme</Link>
        <Link href="/mes-reservations" className={`nav-link${active === 'reservation' ? ' is-on' : ''}`}>Réservation</Link>
      </nav>

      {/* Zone droite : ville + actions utilisateur */}
      <div className="hd__right">
        <div className="hd__city">Casablanca · Maroc</div>

        {user ? (
          // Utilisateur connecté : Dashboard (admin uniquement) + Mon compte + Déconnexion
          <>
            {isAdmin && (
              <Link href="/dashboard" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Dashboard</Link>
            )}
            <Link href="/account" style={{ color: 'inherit', textDecoration: 'none' }}>Mon compte</Link>
            {/* Déconnexion via POST vers la route /auth/logout (Server Action compatible) */}
            <form action="/auth/logout" method="post" style={{ margin: 0 }}>
              <button type="submit" style={{ background: 'transparent', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>
                Déconnexion
              </button>
            </form>
          </>
        ) : (
          // Utilisateur non connecté : lien vers la page de connexion
          <Link href="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Mon compte</Link>
        )}
      </div>
    </header>
  );
}
