// Composant DashNav — Navigation latérale du dashboard administrateur.
// 'use client' : utilise usePathname() (hook de routeur Next.js) pour détecter la page active
// et appliquer la classe CSS "is-on" au lien correspondant.
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Liste des sections du dashboard avec leurs routes
const links = [
  { href: '/dashboard',              label: 'Vue d\'ensemble', exact: true }, // exact: comparaison stricte (évite que /dashboard/films matche /dashboard)
  { href: '/dashboard/films',        label: 'Films'          },
  { href: '/dashboard/salles',       label: 'Salles'         },
  { href: '/dashboard/seances',      label: 'Séances'        },
  { href: '/dashboard/snacks',       label: 'Snacks'         },
  { href: '/dashboard/reservations', label: 'Réservations'   },
  { href: '/dashboard/utilisateurs', label: 'Utilisateurs'   },
];

export default function DashNav({ email }: { email: string }) {
  // usePathname : hook Next.js qui retourne le chemin URL courant (ex: "/dashboard/films")
  // Re-rend le composant automatiquement à chaque navigation pour mettre à jour l'état actif
  const path = usePathname();

  // isOn : détermine si un lien est actif selon le mode de comparaison
  // exact=true : /dashboard uniquement (pas /dashboard/films)
  // exact=false : tout chemin commençant par href (startsWith)
  const isOn = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href);

  return (
    <aside className="dash__side">
      {/* Logo / marque du back-office */}
      <div className="dash__brand"><b>LUMIÈRE</b> · admin</div>

      {/* Liens de navigation — classe "is-on" appliquée sur le lien actif */}
      {links.map(({ href, label, exact }) => (
        <Link
          key={href}
          href={href}
          className={`dash__link${isOn(href, exact) ? ' is-on' : ''}`}
        >
          {label}
        </Link>
      ))}

      {/* Lien de retour vers le site public */}
      <Link href="/" className="dash__link dash__link--back">← Site public</Link>

      {/* Email de l'administrateur connecté (pied de la sidebar) */}
      <div className="dash__foot">{email}</div>
    </aside>
  );
}
