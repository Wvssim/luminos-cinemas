// Composant Stepper — Indicateur de progression du tunnel de réservation.
// Affiche les 6 étapes avec leur état (done / active / à venir).
// Rendu serveur pur (pas d'état client) — la prop current suffit pour calculer les classes.

// Définition des 6 étapes du tunnel (ordre fixe)
const STEPS = [
  { k: 'home',      n: '01', l: 'Films'    },
  { k: 'screenings',n: '02', l: 'Séance'   },
  { k: 'seats',     n: '03', l: 'Places'   },
  { k: 'snacks',    n: '04', l: 'Snacks'   },
  { k: 'pay',       n: '05', l: 'Paiement' },
  { k: 'done',      n: '06', l: 'Billet'   },
] as const;

export default function Stepper({
  current, // Identifiant de l'étape courante — détermine l'état is-done / is-on de chaque item
}: {
  current: typeof STEPS[number]['k'];
}) {
  // Sur la page d'accueil, le stepper n'est pas pertinent (pas encore dans le tunnel)
  if (current === 'home') return null;

  // Index de l'étape courante dans le tableau
  const idx = STEPS.findIndex((s) => s.k === current);

  return (
    <div className="stepper">
      {STEPS.map((s, i) => {
        // Classes CSS appliquées selon la position relative à l'étape courante :
        // i < idx  → is-done  (étape déjà complétée, affichée avec coche)
        // i === idx → is-on   (étape active, mise en évidence)
        // i > idx  → aucune  (étape future, grisée)
        const cls = [
          'stepper__item',
          i < idx  ? 'is-done' : '',
          i === idx ? 'is-on'  : '',
        ].filter(Boolean).join(' ');

        return (
          <div key={s.k} className={cls}>
            <span className="stepper__n">{s.n}</span>
            <span>{s.l}</span>
          </div>
        );
      })}
    </div>
  );
}
