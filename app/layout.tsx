// Layout racine de l'application Next.js (App Router).
// Ce fichier encapsule TOUTES les pages — il est rendu une seule fois et jamais re-monté.
// C'est ici qu'on charge les polices Google Fonts et qu'on définit la langue du document.
import type { Metadata } from 'next';
import './globals.css';
import ChatBubble from '@/components/ChatBubble';

// Métadonnées par défaut — surchargées page par page via export const metadata
export const metadata: Metadata = {
  title: 'Lumière Cinémas — Réservez votre séance en ligne',
  description: 'Plateforme marocaine de réservation de billets de cinéma. Choisissez votre film, sélectionnez votre siège et payez en ligne — votre billet QR code vous attend.',
  keywords: ['cinéma', 'réservation', 'billet', 'Casablanca', 'Maroc', 'Lumière Cinémas'],
  authors: [{ name: 'Wassim Lazim' }],
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="fr" : important pour l'accessibilité et les lecteurs d'écran
    <html lang="fr">
      <head>
        {/* Preconnect : ouvre la connexion TCP vers Google Fonts avant le rendu pour réduire la latence */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Chargement des 3 polices du design system :
            - Instrument Serif : titres et éléments éditoriaux
            - Inter Tight : corps de texte et navigation
            - JetBrains Mono : codes, badges, métadonnées monospace */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* children : contenu rendu par chaque page ou layout imbriqué */}
      <body>
        {children}
        <ChatBubble />
      </body>
    </html>
  );
}
