// Composant SnacksForm — Grille de sélection de snacks avec compteurs de quantité.
// 'use client' : gère les quantités localement avec useState, sans rechargement de page.
// Soumission via Server Action saveSnacks ou skipSnacks (app/snacks/actions.ts).
'use client';
import { useState } from 'react';
import type { Snack } from '@/lib/types';
import { saveSnacks, skipSnacks } from '@/app/snacks/actions';

export default function SnacksForm({ snacks }: { snacks: Snack[] }) {
  // qty : dictionnaire snackId → quantité sélectionnée (initialement tout à 0)
  const [qty, setQty] = useState<Record<string, number>>({});

  // set : incrémente ou décrémente la quantité d'un snack, minimum 0
  const set = (id: string, delta: number) => {
    setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] || 0) + delta) }));
  };

  return (
    // action={saveSnacks} : Server Action qui lit les champs q_<id> et met à jour le draft cookie
    <form action={saveSnacks}>
      <div className="snk__grid">
        {snacks.map((s) => {
          const n = qty[s.id] || 0;
          return (
            // is-on : classe CSS appliquée quand au moins 1 unité est sélectionnée (highlight visuel)
            <div key={s.id} className={`snack ${n > 0 ? 'is-on' : ''}`}>
              <div className="snack__top">
                <span className="snack__emoji">{s.emoji}</span>
                <span className="snack__price">{s.price.toFixed(2)} MAD</span>
              </div>
              <h3 className="snack__name">{s.name}</h3>
              <div className="snack__size">{s.size}</div>
              <p className="snack__desc">{s.description}</p>

              {/* Contrôle de quantité : boutons − et + avec valeur affichée au centre */}
              <div className="snack__qty">
                <button type="button" className="qtyBtn" onClick={() => set(s.id, -1)} disabled={n === 0}>−</button>
                <span className="qtyVal">{n}</span>
                <button type="button" className="qtyBtn" onClick={() => set(s.id, 1)}>+</button>
              </div>

              {/* Champ caché transmis au Server Action : format q_<snackId> = quantité */}
              <input type="hidden" name={`q_${s.id}`} value={n} />
            </div>
          );
        })}
      </div>

      {/* Actions : Passer (snacks vides) ou Continuer vers le paiement */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'flex-end' }}>
        {/* skipSnacks : Server Action appelée directement (sans soumettre le formulaire) */}
        <button type="button" className="btn btn--ghost" onClick={() => skipSnacks()}>Passer</button>
        <button type="submit" className="btn btn--primary">Continuer vers le paiement →</button>
      </div>
    </form>
  );
}
