// Composant FilmForm — Formulaire de création/édition d'un film pour le dashboard admin.
// 'use client' : gère l'état local du trailer (prévisualisation iframe) et la soumission.
// Supporte deux modes : Server Action (action prop) ou API route (apiRoute prop pour upload fichier).
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Film } from '@/lib/types';

// normalizeYouTubeUrl : convertit une URL YouTube vers le format /embed/ pour la prévisualisation
function normalizeYouTubeUrl(url: string): string {
  if (!url) return url;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export default function FilmForm({
  film,      // Données du film existant (mode édition) — undefined en mode création
  action,    // Server Action pour soumission sans upload de fichier
  error,     // Message d'erreur à afficher (passé par la page parente)
  apiRoute,  // Route API pour soumission avec upload d'image (utilise fetch au lieu de Server Action)
}: {
  film?: Partial<Film>;
  action?: (fd: FormData) => void | Promise<void>;
  error?: string;
  apiRoute?: string;
}) {
  // trailerUrl : contrôle le champ YouTube pour afficher une prévisualisation en temps réel
  const [trailerUrl, setTrailerUrl] = useState(film?.trailer_url || '');
  // isSubmitting : désactive le bouton pendant l'upload (évite la double soumission)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // handleSubmit : utilisé uniquement si apiRoute est défini (mode upload d'image).
  // Envoie le FormData via fetch à la route API, puis redirige vers la liste des films.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (apiRoute) {
      e.preventDefault(); // Empêche la soumission native pour gérer l'upload manuellement
      setIsSubmitting(true);
      try {
        const fd = new FormData(e.currentTarget);
        const res = await fetch(apiRoute, { method: 'POST', body: fd });
        if (res.ok) router.push('/dashboard/films');
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setIsSubmitting(false);
      }
    }
    // Si pas d'apiRoute : la soumission native via action= (Server Action) prend le relais
  };

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="form">
      {error && <div className="auth__err">{error}</div>}

      {/* Ligne 1 : titre + réalisateur */}
      <div className="form__row">
        <div className="form__field"><label>Titre</label><input name="title" required defaultValue={film?.title || ''} /></div>
        <div className="form__field"><label>Réalisateur</label><input name="director" defaultValue={film?.director || ''} /></div>
      </div>

      {/* Ligne 2 : année + durée */}
      <div className="form__row">
        <div className="form__field"><label>Année</label><input type="number" name="year" defaultValue={film?.year || ''} /></div>
        <div className="form__field"><label>Durée (min)</label><input type="number" name="duration" defaultValue={film?.duration || ''} /></div>
      </div>

      {/* Ligne 3 : genres (séparés par virgules) + classification */}
      <div className="form__row">
        <div className="form__field"><label>Genres (virgules)</label><input name="genres" defaultValue={(film?.genres || []).join(', ')} /></div>
        <div className="form__field"><label>Classification</label><input name="rating" defaultValue={film?.rating || ''} /></div>
      </div>

      <div className="form__field"><label>Tagline</label><input name="tagline" defaultValue={film?.tagline || ''} /></div>
      <div className="form__field"><label>Synopsis</label><textarea name="synopsis" defaultValue={film?.synopsis || ''} /></div>
      {/* cast_members : liste d'acteurs séparés par virgules, splitée côté serveur */}
      <div className="form__field"><label>Casting (virgules)</label><input name="cast" defaultValue={(film?.cast_members || []).join(', ')} /></div>

      {/* Ligne 4 : upload affiche + URL trailer */}
      <div className="form__row">
        <div className="form__field"><label>Affiche (upload)</label><input type="file" name="poster" accept="image/*" /></div>
        <div className="form__field">
          <label>YouTube trailer</label>
          {/* Champ contrôlé : mise à jour en temps réel pour la prévisualisation iframe */}
          <input
            name="trailer_url"
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
          />
        </div>
      </div>

      {/* Prévisualisation de la bande-annonce : affichée dès qu'une URL est saisie */}
      {trailerUrl && (
        <div style={{ marginBottom: '16px' }}>
          <label>Aperçu</label>
          <iframe
            width="100%"
            height="315"
            src={normalizeYouTubeUrl(trailerUrl)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: '4px', marginTop: '8px' }}
          />
        </div>
      )}

      {/* Ligne 5 : visuels de fallback (si pas d'image uploadée) */}
      <div className="form__row">
        <div className="form__field"><label>Poster gradient (fallback)</label><input name="poster_gradient" defaultValue={film?.poster_gradient || ''} placeholder="linear-gradient(180deg, …)" /></div>
        <div className="form__field"><label>Poster text (fallback)</label><input name="poster_text" defaultValue={film?.poster_text || ''} placeholder="DUNE\nMESSIE" /></div>
      </div>

      {/* Ligne 6 : backdrop (fond panoramique du hero) */}
      <div className="form__row">
        <div className="form__field"><label>Backdrop image (URL)</label><input name="backdrop_image_url" defaultValue={film?.backdrop_image_url || ''} placeholder="https://..." /></div>
        <div className="form__field"><label>Backdrop gradient (fallback)</label><input name="backdrop_gradient" defaultValue={film?.backdrop_gradient || ''} /></div>
      </div>

      {/* Couleur d'accentuation du film (utilisée pour les CSS variables dans le hero) */}
      <div className="form__row">
        <div className="form__field"><label>Accent tone</label><input name="accent_tone" defaultValue={film?.accent_tone || ''} placeholder="#f4a55c" /></div>
      </div>

      <div className="form__actions">
        <button type="submit" className="btn btn--primary">{isSubmitting ? 'Envoi...' : 'Enregistrer →'}</button>
      </div>
    </form>
  );
}
