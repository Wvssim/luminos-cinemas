// Composant SeatPicker — Plan interactif de sélection des sièges.
// 'use client' : composant rendu côté client car il gère un état local interactif
// (sièges sélectionnés) et répond aux clics utilisateur.
'use client';
import { useState, useTransition, useCallback } from 'react';
import type { Seat } from '@/lib/types';
import { SEAT_PRICES } from '@/lib/types';
import { pickSeats } from '@/app/seances/[id]/actions';

// Type interne représentant un siège sélectionné avec son prix calculé
type Picked = { id: string; category: 'standard' | 'premium' | 'duo'; price: number };

export default function SeatPicker({
  screeningId,   // ID de la séance — transmis à la Server Action lors de la validation
  density,       // Densité d'affichage : compact / normal / large (appliqué via classe CSS)
  rows,          // Plan de salle : tableau de rangées avec leurs sièges (généré par buildSeatMap)
  filmTitle,     // Titre du film — affiché dans l'en-tête du composant
  screeningLabel,// Label de la séance (date + heure) — affiché dans l'en-tête
  prices,        // Prix par catégorie de siège (surchargeable par séance depuis Supabase)
}: {
  screeningId: string;
  density: 'compact' | 'normal' | 'large';
  rows: { row: string; seats: Seat[] }[];
  filmTitle: string;
  screeningLabel: string;
  prices?: { standard: number; premium: number; duo: number };
}) {
  // useState : état local de la sélection (liste des sièges choisis par l'utilisateur)
  const [selection, setSelection] = useState<Picked[]>([]);

  // useTransition : permet d'appeler la Server Action pickSeats() sans bloquer l'UI.
  // isPending devient true pendant l'exécution de la Server Action (désactive le bouton).
  const [isPending, start] = useTransition();

  // Construit la table des prix à partir des props ou des valeurs par défaut
  const priceMap: Record<'standard' | 'premium' | 'duo', number> = prices ? {
    standard: prices.standard ?? 12.5,
    premium: prices.premium ?? 16.0,
    duo: prices.duo ?? 32.0,
  } : { standard: 12.5, premium: 16.0, duo: 32.0 };

  // toggle : ajoute ou retire un siège de la sélection au clic.
  // useCallback : mémoïsé pour éviter de recréer la fonction à chaque render.
  const toggle = useCallback((s: Seat) => {
    // Siège occupé : non cliquable
    if (s.occupied) return;

    setSelection((prev) => {
      const exists = prev.find((x) => x.id === s.id);
      if (exists) {
        // Déselectionner : retire le siège de la liste
        return prev.filter((x) => x.id !== s.id);
      } else {
        // Sélectionner : ajoute avec son prix selon la catégorie
        return [...prev, { id: s.id, category: s.category, price: priceMap[s.category] }];
      }
    });
  }, [priceMap]);

  // Calcul du sous-total en temps réel (somme des prix des sièges sélectionnés)
  const total = selection.reduce((a, s) => a + s.price, 0);

  // submit : appelle la Server Action pickSeats() via useTransition.
  // Construit un FormData avec l'ID de séance et la sélection JSON,
  // puis redirige vers /snacks (géré côté serveur dans actions.ts).
  const submit = () => {
    const fd = new FormData();
    fd.set('screeningId', screeningId);
    fd.set('payload', JSON.stringify(selection));
    // start() enveloppe l'appel async pour marquer isPending=true pendant l'exécution
    start(() => { pickSeats(fd); });
  };

  return (
    <div className={`seats density-${density}`}>

      {/* Zone plan de salle */}
      <div className="seats__inner">
        <div className="seats__head">
          <div>
            <h1 className="seats__h1">Choisissez vos <em>places</em></h1>
            <div className="seats__sub">{filmTitle} · {screeningLabel}</div>
          </div>

          {/* Légende des catégories de sièges avec prix */}
          <div className="seats__legend">
            <div className="legendItem">
              <span className="legendDot" style={{ background: '#3b3b40', borderColor: '#3b3b40' }} />
              <b>Standard</b>
              <span>{priceMap.standard.toFixed(2)} MAD</span>
            </div>
            <div className="legendItem">
              <span className="legendDot" style={{ background: '#5a4a2c', borderColor: '#5a4a2c' }} />
              <b>Premium</b>
              <span>{priceMap.premium.toFixed(2)} MAD</span>
            </div>
            <div className="legendItem">
              <span className="legendDot" style={{ background: '#5a2c3a', borderColor: '#5a2c3a' }} />
              <b>Duo</b>
              <span>{priceMap.duo.toFixed(2)} MAD</span>
            </div>
            <div className="legendItem">
              <span className="legendDot" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} />
              <b>Sélectionnée</b>
            </div>
            <div className="legendItem">
              <span className="legendDot" style={{ background: 'var(--bg-3)', borderColor: 'var(--bg-3)', opacity: 0.4 }} />
              <b>Occupée</b>
            </div>
          </div>
        </div>

        {/* Plan de salle : écran + rangées de sièges */}
        <div className="room">
          <div className="room__stage">
            {/* Barre représentant l'écran de cinéma */}
            <div className="room__screen" />
            <div className="room__rows">
              {rows.map((row) => (
                <div key={row.row} className="room__row">
                  {/* Label de rangée à gauche */}
                  <span className="room__rowLabel">{row.row}</span>

                  {row.seats.map((s) => {
                    const sel = selection.find((x) => x.id === s.id);

                    // Construction dynamique des classes CSS du siège :
                    // seat--standard / seat--premium / seat--duo + is-occupied + is-selected + is-aisle
                    const cls = [
                      'seat',
                      `seat--${s.category}`,
                      s.occupied && 'is-occupied',
                      sel && 'is-selected',
                      s.aisleAfter && 'is-aisle', // Espace visuel après ce siège (couloir central)
                    ].filter(Boolean).join(' ');

                    return (
                      <button
                        key={`${row.row}-${s.col}`}
                        className={cls}
                        data-seat={s.id}
                        data-occupied={s.occupied}
                        onClick={() => toggle(s)}
                        title={`${s.id} · ${SEAT_PRICES[s.category].label}`}
                        type="button"
                      />
                    );
                  })}

                  {/* Label de rangée à droite (symétrique) */}
                  <span className="room__rowLabel">{row.row}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panneau latéral : récapitulatif de sélection + total + bouton continuer */}
      <div className="selPanel">
        <div className="selPanel__list">
          {selection.length === 0
            ? <span className="selPanel__placeholder">Cliquez sur une place pour la sélectionner</span>
            : selection.map((s) => (
              // Chip par siège sélectionné avec bouton de suppression
              <span key={s.id} className={`selChip selChip--${s.category}`}>
                <b>{s.id}</b>
                <span>· {SEAT_PRICES[s.category].label} · {s.price.toFixed(2)} MAD</span>
                <button
                  className="selChip__x"
                  onClick={() => setSelection(selection.filter((x) => x.id !== s.id))}
                >×</button>
              </span>
            ))}
        </div>

        <div className="selPanel__sum">
          {/* Sous-total calculé en temps réel */}
          <div className="selPanel__total">
            <span className="selPanel__totalK">Sous-total</span>
            <span className="selPanel__totalV">{total.toFixed(2)} MAD</span>
          </div>

          {/* Bouton Continuer : désactivé si aucun siège sélectionné ou Server Action en cours */}
          <button
            className="btn btn--primary"
            disabled={selection.length === 0 || isPending}
            onClick={submit}
            style={{ opacity: selection.length === 0 ? 0.4 : 1 }}
          >
            Continuer →
          </button>
        </div>
      </div>
    </div>
  );
}
