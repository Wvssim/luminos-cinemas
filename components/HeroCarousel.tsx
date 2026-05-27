// Composant HeroCarousel — Carousel immersif en plein écran sur la page d'accueil.
// 'use client' : gère un état local (film actif + visibilité bande-annonce) avec useState.
'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Film } from '@/lib/types';
import { backdropStyle } from './PosterBg';

// normalizeYouTubeUrl : convertit toute URL YouTube (watch, youtu.be, embed) vers le format /embed/
// nécessaire pour afficher la vidéo dans une iframe sans CORS ni restriction
function normalizeYouTubeUrl(url: string): string {
  if (!url) return url;
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

export default function HeroCarousel({ films }: { films: Film[] }) {
  // idx : index du film actuellement affiché dans le carousel (contrôlé par les dots)
  const [idx, setIdx] = useState(0);

  // showTrailer : contrôle la visibilité de la modale plein écran de la bande-annonce
  const [showTrailer, setShowTrailer] = useState(false);

  // Film actif calculé depuis l'index courant
  const film = films[idx];
  if (!film) return null;

  return (
    <div className="home__hero">
      {/* Fond dynamique : image backdrop avec gradient CSS propre au film */}
      <div className="home__heroBg" style={backdropStyle(film)} />

      <div className="home__heroInner">
        {/* Colonne gauche : badge, titre, tagline, métadonnées, boutons CTA */}
        <div className="home__heroLeft">
          <div className="home__heroBadge">
            <span>En salle</span>
            <span className="dot" />
            <span>Cette semaine</span>
            <span className="dot" />
            <span>{film.director}</span>
          </div>

          <h1 className="home__heroTitle">{film.title}</h1>
          <p className="home__heroTagline">« {film.tagline} »</p>

          {/* Métadonnées du film en ligne */}
          <div className="home__heroMeta">
            <span>{film.duration} min</span>
            <span className="sep">·</span>
            <span>{film.genres.join(' / ')}</span>
            <span className="sep">·</span>
            <span>{film.rating}</span>
            <span className="sep">·</span>
            <span>{film.year}</span>
          </div>

          <div className="home__heroBtns">
            {/* CTA principal : navigue vers la fiche film pour choisir une séance */}
            <Link href={`/films/${film.id}`} className="btn btn--primary">
              Réserver mes places →
            </Link>

            {/* Bouton bande-annonce : affiché uniquement si trailer_url existe */}
            {film.trailer_url && (
              <button className="btn btn--ghost" onClick={() => setShowTrailer(true)}>
                ▶ Bande-annonce
              </button>
            )}
          </div>
        </div>

        {/* Colonne droite : info-card rapide du film */}
        <div className="home__heroRight">
          <div className="home__heroQuick">
            <div className="home__heroQuickRow">
              <span>Genre</span>
              <strong>{film.genres[0]}</strong>
            </div>
            <div className="home__heroQuickRow">
              <span>Durée</span>
              <strong>{film.duration} minutes</strong>
            </div>
            <div className="home__heroQuickRow">
              <span>À partir de</span>
              <strong>35,00 MAD</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Dots de navigation : un par film, clic pour changer de film actif */}
      <div className="home__heroDots">
        {films.map((f, i) => (
          <button
            key={f.id}
            className={`home__heroDot ${i === idx ? 'is-on' : ''}`}
            onClick={() => setIdx(i)}
            aria-label={f.title}
          />
        ))}
      </div>

      {/* Modale bande-annonce : overlay plein écran avec iframe YouTube */}
      {showTrailer && film.trailer_url && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '2rem',
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '900px', aspectRatio: '16/9' }}>
            {/* Bouton fermeture modale */}
            <button
              onClick={() => setShowTrailer(false)}
              style={{
                position: 'absolute', top: '-40px', right: 0,
                background: 'none', border: 'none', color: 'white',
                fontSize: '24px', cursor: 'pointer', padding: '0.5rem',
              }}
            >✕</button>

            {/* Iframe YouTube avec URL normalisée en format embed */}
            <iframe
              width="100%"
              height="100%"
              src={normalizeYouTubeUrl(film.trailer_url)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '4px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
