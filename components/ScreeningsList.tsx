// Composant ScreeningsList — Liste des séances d'un film, groupées par date.
// 'use client' : gère l'onglet de date actif avec useState.
// Utilisé sur la fiche film (/films/[id]) pour permettre de naviguer entre les jours.
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Screening } from '@/lib/types';
import { formatTime } from '@/lib/seatmap';

// Type enrichi : Screening + nombre de places déjà réservées (calculé côté serveur)
type ScreeningWithCount = Screening & { booked: number };

export default function ScreeningsList({ screenings }: { screenings: ScreeningWithCount[] }) {
  // useMemo : regroupe les séances par date YYYY-MM-DD une seule fois au montage.
  // Évite de recalculer le groupement à chaque re-render (optimisation de performance).
  const grouped = useMemo(() => {
    const byDate: Record<string, ScreeningWithCount[]> = {};
    for (const s of screenings) {
      const d = new Date(s.starts_at).toISOString().slice(0, 10); // "YYYY-MM-DD"
      (byDate[d] ||= []).push(s); // Crée le tableau si absent, puis y ajoute la séance
    }
    // Trie les jours chronologiquement pour affichage ordonné
    return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
  }, [screenings]);

  // dateIdx : index du jour actuellement sélectionné dans les onglets
  const [dateIdx, setDateIdx] = useState(0);

  // Cas vide : aucune séance programmée pour ce film
  if (grouped.length === 0) {
    return <p style={{ color: 'var(--ink-3)' }}>Aucune séance programmée.</p>;
  }

  // labelOf : calcule le label d'affichage d'un onglet de date
  // Retourne "Aujourd'hui" / "Demain" si applicable, sinon le jour court en fr-FR
  const labelOf = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let head = '';
    if (dd.getTime() === today.getTime()) head = "Aujourd'hui";
    else if (dd.getTime() === tomorrow.getTime()) head = 'Demain';
    const long = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    return { head, long };
  };

  // Séances du jour actuellement sélectionné
  const shown = grouped[dateIdx][1];

  return (
    <>
      {/* Section onglets de dates */}
      <div className="scr__sect">
        <h3 className="scr__sectTitle">Choisir une date</h3>
        <div className="scr__dates">
          {grouped.map(([d, items], i) => {
            const lbl = labelOf(items[0].starts_at);
            return (
              // Clic sur un onglet : met à jour dateIdx pour afficher les séances du jour
              <button
                key={d}
                className={`scr__date ${i === dateIdx ? 'is-on' : ''}`}
                onClick={() => setDateIdx(i)}
              >
                {/* Ligne supérieure : "Auj." / "Dem." / premier mot du jour (ex: "Lun.") */}
                <small>{lbl.head || lbl.long.split(' ')[0]}</small>
                {/* Ligne inférieure : date complète (ex: "lun. 23 mai") */}
                <span>{lbl.long}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section liste des séances du jour sélectionné */}
      <div className="scr__sect">
        <h3 className="scr__sectTitle">Séances disponibles</h3>
        <div className="scr__shows">
          {shown.map((s) => {
            // Calcul des places restantes : total - places déjà réservées
            const left = s.total_seats - s.booked;
            return (
              // Chaque séance est un lien vers la page de sélection des sièges
              <Link key={s.id} href={`/seances/${s.id}`} className="show" style={{ textDecoration: 'none' }}>
                {/* Heure de début de la séance */}
                <div className="show__time">{formatTime(s.starts_at)}</div>

                {/* Informations de salle et format (VOSTFR, IMAX, etc.) */}
                <div className="show__info">
                  <span className="show__room">{s.room}</span>
                  <span className="show__format">{s.format}</span>
                </div>

                {/* Compteur de places — is-low appliqué sous 30 places pour alerter visuellement */}
                <div className={`show__seats ${left < 30 ? 'is-low' : ''}`}>
                  <b>{left}</b>
                  <span>places libres</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
