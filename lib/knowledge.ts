// Base de connaissances Lumière Cinémas — utilisée par le pipeline RAG.
// Inlinée comme module TS pour garantir le bundling en environnement serverless (Vercel).

export type Chunk = {
  id: string;
  title: string;
  content: string;
};

export const KNOWLEDGE_CHUNKS: Chunk[] = [
  {
    id: 'presentation',
    title: 'Présentation de Lumière Cinémas',
    content: `Lumière Cinémas est une plateforme marocaine de réservation de billets de cinéma en ligne.
Elle permet de réserver des places, choisir son siège, commander des snacks et payer en ligne depuis n'importe quel appareil, sans file d'attente.
Le nom "Lumière" est un hommage aux frères Lumière, inventeurs du cinéma.
Le design utilise un thème sombre avec un accent rouge #E50914, inspiré de l'atmosphère d'une salle obscure.
La plateforme est développée avec Next.js 15, Supabase (PostgreSQL), Stripe et TypeScript.`,
  },
  {
    id: 'reservation-steps',
    title: 'Comment réserver un billet — étapes complètes',
    content: `Le tunnel de réservation comporte 6 étapes :
1. Page d'accueil : choisissez un film parmi ceux à l'affiche cette semaine.
2. Fiche film : consultez le synopsis, le casting, la durée, la classification, et choisissez une séance.
3. Plan de salle : sélectionnez vos sièges sur le plan interactif. Le sous-total se met à jour en temps réel.
4. Snacks : commandez optionnellement des consommations à récupérer au comptoir.
5. Paiement : payez par carte bancaire via Stripe Checkout, ou choisissez le paiement en espèces au guichet.
6. Billet : recevez votre billet numérique avec QR code et référence unique (format LM-2026-XXXX).
L'état de la réservation est sauvegardé entre les étapes grâce à un cookie sécurisé (valide 1 heure).`,
  },
  {
    id: 'sieges-prix',
    title: 'Catégories de sièges et tarifs',
    content: `Il existe 3 catégories de sièges dans chaque salle :
- Standard : 12,50 MAD par place. Confort classique, disponible dans toutes les rangées.
- Premium : 16,00 MAD par place. Meilleure visibilité, rangées centrales, plus d'espace.
- Duo : 32,00 MAD pour 2 places côte à côte. Idéal pour les couples et amis, avec accoudoir central relevable.
Les prix peuvent varier légèrement selon la séance et le format de projection (IMAX, Dolby Atmos).
Sur le plan de salle, les sièges occupés sont grisés et non sélectionnables.`,
  },
  {
    id: 'snacks',
    title: 'Snacks et consommations disponibles',
    content: `Vous pouvez commander des snacks en ligne avant votre séance. Ils sont préparés et récupérables au comptoir.
- Popcorn salé Grand 1L : 7,50 MAD
- Popcorn sucré Moyen 60cl : 6,00 MAD (caramel maison)
- Duo Popcorn + 2 sodas (menu) : 14,00 MAD
- Soda 50cl (Coca-Cola, Orangina, Sprite) : 4,50 MAD
- Eau plate Évian 50cl : 3,00 MAD
- M&M's sachet 200g (chocolat ou peanut) : 5,50 MAD
- Bonbons Haribo sachet 250g : 5,00 MAD
- Glace artisanale pot 120ml (vanille bourbon ou choco intense) : 6,50 MAD
La commande de snacks est optionnelle. Vous pouvez aussi acheter directement à l'accueil du cinéma.`,
  },
  {
    id: 'paiement',
    title: 'Modes de paiement',
    content: `Deux modes de paiement sont disponibles :
1. Carte bancaire en ligne : paiement sécurisé via Stripe Checkout. Accepte Visa, Mastercard et cartes bancaires internationales. Le montant est débité immédiatement. La réservation est confirmée instantanément.
2. Espèces au guichet : choisissez cette option si vous préférez payer sur place. La réservation passe en statut "en attente" (pending) jusqu'au paiement au cinéma.
Les transactions en ligne sont sécurisées (PCI-DSS via Stripe). Aucune donnée de carte n'est stockée sur nos serveurs.`,
  },
  {
    id: 'billet-qr',
    title: 'Billet numérique et QR code',
    content: `Après confirmation de la réservation, un billet numérique est généré.
Il contient :
- Un QR code unique scannable à l'entrée de la salle
- La référence de réservation (ex : LM-2026-3847)
- Le titre du film, la date, l'heure et la salle
- La liste des sièges réservés avec leur catégorie
- Le récapitulatif des snacks commandés
Le billet est accessible depuis "Mes réservations" dans votre espace compte.
Montrez simplement votre écran de téléphone au personnel du cinéma — pas besoin d'imprimer.`,
  },
  {
    id: 'compte',
    title: 'Créer un compte et se connecter',
    content: `Vous pouvez réserver avec ou sans compte Lumière Cinémas.
Pour créer un compte : cliquez sur "S'inscrire", entrez votre nom complet, email et mot de passe.
Un profil est créé automatiquement. Vous pouvez ensuite vous connecter via "Mon compte".
Avantages d'un compte : historique complet de vos réservations, accès rapide à vos billets, et redirection vers la page souhaitée après connexion.
Si vous réservez sans compte, votre email est enregistré pour retrouver la réservation.
La réinitialisation du mot de passe s'effectue depuis la page de connexion.`,
  },
  {
    id: 'mes-reservations',
    title: 'Gérer mes réservations',
    content: `La page "Mes réservations" (accessible depuis votre espace compte) affiche l'historique complet de toutes vos réservations.
Pour chaque réservation, vous voyez : le film, la date et l'heure de la séance, les sièges, le total payé et le statut.
Les statuts possibles sont : Confirmée, En attente (paiement espèces à effectuer), Annulée.
Vous pouvez accéder à votre billet QR code depuis cette page pour chaque réservation confirmée.`,
  },
  {
    id: 'programme',
    title: 'Programme des séances',
    content: `La page Programme (/programme) affiche toutes les séances disponibles, organisées par jour avec des onglets de navigation.
Vous pouvez filtrer les séances par film et naviguer facilement d'un jour à l'autre.
La page d'accueil affiche uniquement les films à l'affiche cette semaine.
La page Prochainement (/prochainement) liste les films à venir qui ne sont pas encore à l'affiche.
La page Salles (/salles) présente les équipements de chaque salle (Dolby Atmos, IMAX, 4K HDR).`,
  },
  {
    id: 'salles-formats',
    title: 'Salles et formats de projection',
    content: `Lumière Cinémas propose plusieurs formats de projection selon les séances :
- VOSTFR · 4K HDR en Salle Dolby Atmos
- VOSTFR · IMAX en Salle IMAX
- VF (version française) selon les disponibilités
La capacité des salles varie : la Salle Dolby Atmos accueille 168 spectateurs, la Salle IMAX en accueille 220.
Les informations sur les salles (technologie, couleur d'ambiance) sont visibles sur la page Salles du site.`,
  },
  {
    id: 'technique',
    title: 'Informations techniques et compatibilité',
    content: `Lumière Cinémas est une application web responsive, optimisée pour tous les appareils : desktop, tablette et smartphone.
Elle fonctionne sur tous les navigateurs modernes : Chrome, Firefox, Safari, Edge.
L'application utilise le Server-Side Rendering (SSR) via Next.js 15 pour des chargements rapides même sur connexion mobile 4G.
Aucune installation n'est nécessaire — tout fonctionne directement depuis le navigateur.
La plateforme est hébergée sur Vercel avec un CDN mondial pour des performances optimales.`,
  },
  {
    id: 'dashboard-admin',
    title: 'Dashboard administrateur',
    content: `Le back-office administrateur (/dashboard) est accessible uniquement aux comptes avec le rôle "admin".
Il permet de gérer l'intégralité du contenu de la plateforme :
- Films : créer, modifier, supprimer des films avec upload d'affiche
- Séances : programmer des séances avec date, heure, salle et prix par catégorie de siège
- Salles : gérer la capacité et la technologie de chaque salle
- Snacks : gérer le catalogue de consommations
- Réservations : voir les 200 dernières réservations avec leurs statuts
- Utilisateurs : attribuer ou révoquer le rôle administrateur
Un tableau de bord affiche les KPIs : nombre de films, séances, salles, et chiffre d'affaires total confirmé.`,
  },
  {
    id: 'securite',
    title: 'Sécurité et protection des données',
    content: `La sécurité est au cœur de Lumière Cinémas :
- Authentification via Supabase Auth avec JWT (tokens signés)
- Sessions persistées dans des cookies sécurisés côté serveur (SSR)
- Row Level Security (RLS) PostgreSQL : chaque utilisateur ne voit que ses propres données
- Paiements sécurisés via Stripe (certifié PCI-DSS niveau 1) — aucune donnée de carte stockée
- Routes privées protégées par middleware (dashboard admin, espace compte)
- Les mots de passe sont hachés côté Supabase Auth (bcrypt)
La plateforme est conforme à la loi marocaine 09-08 sur la protection des données personnelles.`,
  },
  {
    id: 'faq',
    title: 'Questions fréquentes',
    content: `Q: Puis-je réserver sans compte ?
R: Oui, vous pouvez réserver en tant qu'invité. Votre email est enregistré pour retrouver la réservation.

Q: Comment annuler ma réservation ?
R: Contactez directement le cinéma avec votre référence de réservation (LM-2026-XXXX).

Q: Mon QR code ne fonctionne pas à l'entrée ?
R: Assurez-vous d'afficher votre billet depuis "Mes réservations" et non depuis une capture d'écran.

Q: Puis-je modifier mes sièges après la réservation ?
R: Non, les sièges sont fixés à la confirmation. Contactez le cinéma pour toute modification.

Q: Le paiement par carte est-il sécurisé ?
R: Oui, le paiement est géré par Stripe, certifié PCI-DSS. Lumière Cinémas ne stocke aucune donnée bancaire.

Q: L'application fonctionne-t-elle sur mobile ?
R: Oui, l'interface est entièrement responsive et optimisée pour smartphone et tablette.

Q: Comment devenir administrateur ?
R: Le rôle admin est attribué manuellement par un administrateur existant depuis le dashboard utilisateurs.`,
  },
];
