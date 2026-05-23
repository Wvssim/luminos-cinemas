// Utilitaires de style pour les images de fond des films.
// Retournent des objets CSSProperties compatibles avec la prop style= de React.
// Utilisé par les cartes films, le HeroCarousel et la page programme.
import type { Film } from '@/lib/types';

// posterStyle : style de l'affiche portrait du film (ratio 2:3).
// Si poster_url existe → image de fond centrée et couvrant tout le conteneur.
// Sinon → gradient CSS défini par film (fallback couleur sombre générique).
export function posterStyle(
  film: Pick<Film, 'poster_url' | 'poster_gradient'>
): React.CSSProperties {
  if (film.poster_url) {
    return {
      backgroundImage: `url(${film.poster_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: film.poster_gradient || 'linear-gradient(180deg,#3b3b40,#08080a)' };
}

// backdropStyle : style du fond panoramique (backdrop) du HeroCarousel.
// Si backdrop_image_url existe → image de fond plein écran.
// Sinon → gradient radial propre au film pour une ambiance colorée unique.
export function backdropStyle(
  film: Pick<Film, 'backdrop_image_url' | 'backdrop_gradient'>
): React.CSSProperties {
  if (film.backdrop_image_url) {
    return {
      backgroundImage: `url(${film.backdrop_image_url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: film.backdrop_gradient || 'radial-gradient(ellipse at 50% 30%, #2a2a30, #08080a)' };
}
