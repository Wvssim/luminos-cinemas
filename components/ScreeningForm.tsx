// Composant ScreeningForm — Formulaire de création/édition d'une séance pour le dashboard admin.
// Server Component : pas d'état client, utilise une Server Action pour la soumission.
// Fonctionne en mode création (screening absent) ou édition (screening préchargé).
import type { Film, Screening } from '@/lib/types';

// toLocal : convertit un ISO datetime UTC en chaîne locale YYYY-MM-DDThh:mm
// Format requis par <input type="datetime-local"> (ne comprend pas les fuseaux horaires)
function toLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ScreeningForm({
  screening, // Données de la séance existante (mode édition) — undefined en mode création
  films,     // Liste des films pour le menu déroulant (id + titre)
  action,    // Server Action appelée à la soumission (createScreening ou updateScreening)
  error,     // Message d'erreur de la dernière tentative (passé par redirect(?error=...))
}: {
  screening?: Partial<Screening>;
  films: Pick<Film, 'id' | 'title'>[];
  action: (fd: FormData) => void | Promise<void>;
  error?: string;
}) {
  return (
    <form action={action} className="form">
      {error && <div className="auth__err">{error}</div>}

      {/* Sélection du film associé à la séance */}
      <div className="form__field">
        <label>Film</label>
        <select name="film_id" required defaultValue={screening?.film_id || ''}>
          <option value="" disabled>— Choisir —</option>
          {films.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
        </select>
      </div>

      {/* Date/heure de début + capacité totale */}
      <div className="form__row">
        <div className="form__field">
          <label>Date & heure</label>
          {/* defaultValue converti en format local pour l'input datetime-local */}
          <input type="datetime-local" name="starts_at" required defaultValue={screening?.starts_at ? toLocal(screening.starts_at) : ''} />
        </div>
        <div className="form__field">
          <label>Total places</label>
          <input type="number" name="total_seats" required defaultValue={screening?.total_seats || 168} />
        </div>
      </div>

      {/* Salle + format de projection */}
      <div className="form__row">
        <div className="form__field"><label>Salle</label><input name="room" required defaultValue={screening?.room || ''} placeholder="Salle 1 · Dolby Atmos" /></div>
        <div className="form__field"><label>Format</label><input name="format" defaultValue={screening?.format || ''} placeholder="VOSTFR · 4K HDR" /></div>
      </div>

      {/* Prix par catégorie de siège en MAD (surcharge des valeurs par défaut de SEAT_PRICES) */}
      <div className="form__row">
        <div className="form__field"><label>Prix standard</label><input type="number" step="0.5" name="price_standard" defaultValue={screening?.price_standard ?? 12.5} /></div>
        <div className="form__field"><label>Prix premium</label><input type="number" step="0.5" name="price_premium" defaultValue={screening?.price_premium ?? 16} /></div>
      </div>
      <div className="form__field"><label>Prix duo</label><input type="number" step="0.5" name="price_duo" defaultValue={screening?.price_duo ?? 32} /></div>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary">Enregistrer →</button>
      </div>
    </form>
  );
}
