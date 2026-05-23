// Composant RoomForm — Formulaire de création/édition d'une salle pour le dashboard admin.
// Server Component : pas d'état client, soumission via Server Action (createRoom / updateRoom).
// Fonctionne en mode création (room absent) ou édition (room préchargé).

// Type Room local : sous-ensemble des colonnes de la table rooms
type Room = {
  id?: string;
  name?: string;
  tech?: string | null;          // Technologie de projection (ex: "Dolby Atmos · 4K HDR")
  capacity?: number;
  description?: string | null;
  accent_color?: string | null;  // Couleur CSS hexadécimale unique par salle (ex: "#1a6ebd")
};

export default function RoomForm({
  room,   // Données de la salle existante (mode édition) — undefined en mode création
  action, // Server Action appelée à la soumission
  error,  // Message d'erreur de la dernière tentative
}: {
  room?: Room;
  action: (fd: FormData) => void | Promise<void>;
  error?: string;
}) {
  return (
    <form action={action} className="form">
      {error && <div className="auth__err">{error}</div>}

      {/* Nom de la salle + technologie de projection */}
      <div className="form__row">
        <div className="form__field">
          <label>Nom de la salle</label>
          <input name="name" required defaultValue={room?.name || ''} placeholder="Salle 1" />
        </div>
        <div className="form__field">
          <label>Technologie</label>
          <input name="tech" defaultValue={room?.tech || ''} placeholder="Dolby Atmos · 4K HDR" />
        </div>
      </div>

      {/* Capacité + couleur d'accent (utilisée pour le fond radial de la carte salle) */}
      <div className="form__row">
        <div className="form__field">
          <label>Capacité (fauteuils)</label>
          <input type="number" name="capacity" required min={1} defaultValue={room?.capacity ?? 168} />
        </div>
        <div className="form__field">
          <label>Couleur accent (hex)</label>
          {/* accent_color : couleur unique par salle affichée dans les cartes et les pastilles nav */}
          <input name="accent_color" defaultValue={room?.accent_color || '#f4efe6'} placeholder="#f4a55c" />
        </div>
      </div>

      {/* Description libre de la salle (équipements, ambiance, etc.) */}
      <div className="form__field">
        <label>Description</label>
        <textarea name="description" defaultValue={room?.description || ''} placeholder="Décrivez l'équipement, l'ambiance…" />
      </div>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary">Enregistrer →</button>
      </div>
    </form>
  );
}
