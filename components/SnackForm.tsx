// Composant SnackForm — Formulaire de création/édition d'un snack pour le dashboard admin.
// Server Component : pas d'état client, soumission via Server Action (createSnack / updateSnack).
// Fonctionne en mode création (snack absent) ou édition (snack préchargé + lockId=true).
import type { Snack } from '@/lib/types';

export default function SnackForm({
  snack,          // Données du snack existant (mode édition) — undefined en mode création
  action,         // Server Action appelée à la soumission
  error,          // Message d'erreur de la dernière tentative
  lockId = false, // Si true : verrouille le champ ID (ne doit pas changer en mode édition)
}: {
  snack?: Partial<Snack>;
  action: (fd: FormData) => void | Promise<void>;
  error?: string;
  lockId?: boolean;
}) {
  return (
    <form action={action} className="form">
      {error && <div className="auth__err">{error}</div>}

      {/* ID (slug personnalisé) + emoji illustratif */}
      <div className="form__row">
        <div className="form__field">
          <label>ID (slug)</label>
          {/* readOnly en mode édition : l'ID est la clé primaire et ne doit pas changer */}
          <input name="id" required defaultValue={snack?.id || ''} readOnly={lockId} placeholder="pop-l" />
        </div>
        <div className="form__field">
          <label>Emoji</label>
          <input name="emoji" defaultValue={snack?.emoji || ''} placeholder="🍿" />
        </div>
      </div>

      {/* Nom commercial + format/taille */}
      <div className="form__row">
        <div className="form__field">
          <label>Nom</label>
          <input name="name" required defaultValue={snack?.name || ''} />
        </div>
        <div className="form__field">
          <label>Format</label>
          <input name="size" defaultValue={snack?.size || ''} placeholder="Grand · 1L" />
        </div>
      </div>

      {/* Prix en MAD avec step de 0.5 MAD */}
      <div className="form__field">
        <label>Prix (MAD)</label>
        <input type="number" step="0.5" name="price" required defaultValue={snack?.price ?? ''} />
      </div>

      {/* Description courte affichée sur la carte snack côté public */}
      <div className="form__field">
        <label>Description</label>
        <textarea name="description" defaultValue={snack?.description || ''} />
      </div>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary">Enregistrer →</button>
      </div>
    </form>
  );
}
