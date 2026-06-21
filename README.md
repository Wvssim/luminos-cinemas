# Lumière Cinémas — Plateforme de réservation SSR

Projet de Fin d'Année (PFA) — Application web fullstack de réservation de places de cinéma.
**Next.js 15 (App Router) + Supabase + Stripe**

---
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama%203.1-F55036)

---

## 📌 Contexte académique

| | |
|---|---|
| **Auteur** | Wassim Lazim |
| **Filière / Niveau** | DSI — Développement des Systèmes Informatique · 4ᵉ année |
| **Type** | Projet de Fin d'Année (PFA) |
| **Établissement** | École Marocaine des Sciences de l'Ingénieur (EMSI) |
| **Année universitaire** | 2025–2026 |

## 📄 Livrables (documents du projet)

Les documents de soutenance sont à la racine du dépôt :

| Document | Fichier | Contenu |
|---|---|---|
| **Rapport technique** | [`Rapport_Cinema_SSR.pdf`](./Rapport_Cinema_SSR.pdf) | Rapport complet : analyse des besoins, conception (UML), stack, implémentation, tests, et volet entrepreneuriat (Chap. 11) |
| **Cahier des charges** | [`Cahier_de_charge_cinema.pdf`](./Cahier_de_charge_cinema.pdf) | Cahier des charges logique (CdCL) : besoins BF/BNF (MoSCoW), cas d'usage, critères d'acceptation, matrice de traçabilité |
| **Volet entrepreneuriat** | [`Rapport_Entrepreneuriat_Wassim_Lazim.pdf`](./Rapport_Entrepreneuriat_Wassim_Lazim.pdf) | Étude entrepreneuriale autonome : marché, SWOT/PESTEL/Porter, faisabilité financière, aspect juridique |

> Sources LaTeX : [`rapport.tex`](./rapport.tex) et [`cahier_des_charges.tex`](./cahier_des_charges.tex) — à compiler avec **XeLaTeX**.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 — App Router, Server Components, Server Actions |
| Base de données | Supabase (PostgreSQL) avec Row Level Security (RLS) |
| Authentification | Supabase Auth — email/password, sessions via cookies SSR |
| Paiement | Stripe Checkout (carte) + paiement en espèces |
| Stockage | Supabase Storage (affiches films) |
| Assistant IA | Chatbot RAG — retrieval TF-IDF + Groq (Llama 3.1 8B) |
| Langage | TypeScript + React 19 |
| Style | CSS custom — design sombre, accent rouge `#E50914` |

---

## Couverture des objectifs TD

### TD2 — Authentification

**Concept du cours :** mettre en place un flux login/logout complet avec protection des routes privées.

**Implémentation dans le projet :**

- **Login** (`app/auth/actions.ts` → fonction `login()`) : appel à `supabase.auth.signInWithPassword()` avec email + mot de passe. En cas d'erreur Supabase, redirection vers `/login?error=...` pour afficher le message. En cas de succès, `revalidatePath('/', 'layout')` force le re-rendu du Header (qui affiche "Déconnexion" à la place de "Mon compte").

- **Logout** (`app/auth/logout/route.ts`) : endpoint POST qui appelle `supabase.auth.signOut()` puis redirige vers `/`. Utilise POST (et non GET) pour éviter la déconnexion accidentelle via les prefetch Next.js ou les crawlers.

- **Inscription** (`app/auth/actions.ts` → `signup()`) : crée le compte via `supabase.auth.signUp()` avec les métadonnées `full_name`. Un trigger PostgreSQL (`handle_new_user`) crée automatiquement un profil dans la table `profiles`.

- **Protection des routes privées** : deux niveaux de garde.
  - `middleware.ts` : rafraîchit le token de session à chaque requête (pattern `@supabase/ssr`).
  - `app/dashboard/layout.tsx` : double vérification côté serveur — `getUser()` pour la session, puis `profiles.role === 'admin'` pour le rôle. Redirige vers `/login?next=/dashboard` ou `/` si les conditions ne sont pas remplies.
  - Pages utilisateur (`app/mes-reservations`, `app/account`) : guard `if (!user) redirect('/login?next=...')`.

- **Redirection post-connexion** : le champ caché `next` dans le formulaire de login (`app/login/page.tsx`) préserve l'URL d'origine. Après connexion réussie, `redirect(next)` renvoie l'utilisateur là où il voulait aller.

---

### TD3 — Routing + CRUD

**Concept du cours :** navigation applicative structurée et opérations CRUD complètes sur les entités métier.

**Implémentation dans le projet :**

- **Routing** (Next.js App Router) : organisation en segments dynamiques.
  - `/` → accueil avec films de la semaine
  - `/films/[id]` → fiche film avec ses séances
  - `/seances/[id]` → plan de salle interactif
  - `/snacks` → sélection extras
  - `/pay` → paiement
  - `/confirm/[id]` → billet final avec QR code
  - `/dashboard/*` → back-office admin complet
  - `/programme` → programme par jour avec onglets
  - `/prochainement`, `/salles` → pages publiques

- **CRUD Films** (`app/dashboard/films/`) :
  - **Create** : `actions.ts → createFilm()` — parse le FormData, upload optionnel de l'affiche vers Supabase Storage, insertion en base, `revalidatePath`.
  - **Read** : `page.tsx` — liste avec miniatures d'affiches.
  - **Update** : `[id]/page.tsx` + `/api/films/[id]/route.ts` — route API dédiée pour gérer le multipart (upload image).
  - **Delete** : `DeleteButton` + `deleteFilm()` — confirmation `window.confirm` avant suppression.

- **CRUD Séances** (`app/dashboard/seances/`) : même pattern, avec conversion `datetime-local → ISO 8601` et prix par catégorie de siège.

- **CRUD Salles** (`app/dashboard/salles/`) : gestion de la capacité, technologie et couleur d'accent.

- **CRUD Snacks** (`app/dashboard/snacks/`) : catalogue avec ID slug personnalisé.

- **Lecture Réservations** (`app/dashboard/reservations/`) : liste avec jointures imbriquées Supabase (`reservations → screenings → films`).

---

### TD4 — Couche UI

**Concept du cours :** structurer et clarifier l'interface sans casser la logique métier — séparation composants/pages.

**Implémentation dans le projet :**

- **Composants réutilisables** (`components/`) : chaque élément d'interface est isolé dans son propre composant avec une responsabilité unique.
  - `Header` : navigation principale, conditionnel selon le rôle (admin voit le lien Dashboard).
  - `Stepper` : barre de progression du tunnel de réservation (6 étapes), calcule les classes `is-done`/`is-on` depuis la prop `current`.
  - `HeroCarousel` : carrousel immersif avec fond dynamique par film et modale bande-annonce.
  - `FilmsGrid` : grille avec recherche locale instantanée (`useState`, pas de rechargement).
  - `SeatPicker` : plan de salle interactif avec sélection multi-sièges et calcul du sous-total en temps réel.
  - `ScreeningsList` : onglets de dates avec `useMemo` pour le groupement.

- **Séparation Server / Client** : les composants marqués `'use client'` gèrent uniquement l'état interactif (sélection, recherche, carousel). Les données sont toujours chargées côté serveur dans les pages parentes et passées en props.

- **CSS avec variables** (`app/globals.css`) : système de design tokens (`--ink`, `--bg-2`, `--accent`, `--serif`, `--mono`) pour une cohérence visuelle globale.

- **Formulaires dashboard** : `FilmForm`, `ScreeningForm`, `RoomForm`, `SnackForm` — composants génériques fonctionnant en mode création ou édition selon les props reçues.

---

### TD5 — Version finale

**Concept du cours :** centraliser l'authentification, injecter automatiquement le token JWT dans les requêtes API, stabiliser et optimiser.

**Implémentation dans le projet :**

> **Note :** le cours cible Redux Toolkit comme solution de gestion d'état centralisée. Ce projet adopte une approche plus moderne et adaptée au SSR : les Server Components et Server Actions de Next.js 15 remplacent Redux pour la gestion de l'état global, avec des avantages équivalents (pas de prop drilling, état centralisé côté serveur).

- **Gestion d'état centralisée sans Redux** :
  - Le **draft cookie** (`lib/booking.ts` — `getDraft/setDraft/clearDraft`) joue le rôle du store Redux pour l'état du tunnel de réservation. Il persiste `screeningId + seats + snacks` entre les 6 pages sans prop drilling ni re-renders inutiles.
  - Les **Server Actions** (`app/auth/actions.ts`, `app/pay/actions.ts`, etc.) centralisent toute la logique métier côté serveur, équivalent à des reducers Redux.

- **JWT réel (pas simulé)** : Supabase Auth génère de vrais JWT signés. Le client SSR (`lib/supabase/server.ts`) les lit depuis les cookies à chaque requête via `createServerClient` de `@supabase/ssr` et les injecte automatiquement dans les headers des appels Supabase.

- **Injection automatique du token** : contrairement au cours où le token est injecté manuellement dans les headers fetch, ici `createClient()` et `createAdminClient()` (`lib/supabase/server.ts`) encapsulent cette logique — chaque appel Supabase transporte automatiquement le Bearer token de session.

- **Optimisation des performances** :
  - `force-dynamic` sur toutes les pages à données temps réel (évite le cache stale).
  - `revalidatePath()` après chaque mutation pour invalider sélectivement le cache Next.js.
  - `Promise.all()` sur la page dashboard pour charger les 5 KPIs en parallèle.
  - `useMemo` dans `ScreeningsList` pour ne pas recalculer le groupement par date à chaque render.
  - `useCallback` dans `SeatPicker` pour mémoïser le handler de sélection de siège.
  - Server Components par défaut — le JS client n'est envoyé que pour les composants `'use client'`.

- **Deux clients Supabase distincts** (`lib/supabase/server.ts`) :
  - `createClient()` — clé anon, respecte RLS → opérations utilisateur.
  - `createAdminClient()` — clé `service_role`, bypass RLS → opérations admin (gestion rôles, upload storage).

---

## Tunnel de réservation (flow complet)

```
/                    → Accueil — films à l'affiche cette semaine
/films/[id]          → Fiche film — synopsis, bande-annonce, séances disponibles
/seances/[id]        → Plan de salle — sélection des sièges (Standard / Premium / Duo)
/snacks              → Extras — commande optionnelle récupérée au comptoir
/pay                 → Paiement — Stripe Checkout (carte) ou espèces (pending)
/confirm/[id]        → Billet — QR code + détails de la réservation
```

L'état entre les étapes est persisté dans un **cookie draft** (`lumiere_draft`, durée 1h) pour éviter de stocker des données partielles en base avant confirmation.

---

## Dashboard administrateur (`/dashboard`)

Accessible uniquement aux utilisateurs avec `profiles.role = 'admin'`.

| Section | Fonctionnalités |
|---|---|
| Vue d'ensemble | KPIs : films, séances, salles, CA confirmé |
| Films | CRUD complet + upload affiche (Supabase Storage) |
| Séances | CRUD + prix par catégorie de siège |
| Salles | CRUD + technologie + couleur d'accent |
| Snacks | CRUD catalogue |
| Réservations | Liste complète (200 dernières) avec statuts |
| Utilisateurs | Gestion des rôles admin/user |

---

## Installation

```bash
npm install
cp .env.local.example .env.local
# Remplir les variables d'environnement
npm run dev
```

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=posters
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=                       # chatbot RAG (console.groq.com — offre gratuite)
```

### Setup Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. SQL Editor → coller `supabase/schema.sql` → Run
3. Auth → Providers → activer Email
4. Créer un compte via `/signup`, puis promouvoir admin :
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'votre@email.com';
   ```

---

## Structure du projet

```
app/
  page.tsx                    — Accueil (filtre films de la semaine courante)
  films/[id]/                 — Fiche film + séances à venir
  seances/[id]/               — Plan de salle interactif
  snacks/                     — Sélection extras
  pay/                        — Paiement (Stripe ou espèces)
  pay/success/                — Callback Stripe → création réservation
  confirm/[id]/               — Billet + QR code
  programme/                  — Programme par jour (onglets + recherche)
  prochainement/              — Films à venir
  salles/                     — Présentation des salles
  mes-reservations/           — Historique réservations utilisateur
  login/ signup/ account/     — Authentification et gestion de compte
  auth/                       — Server Actions auth + route logout
  dashboard/                  — Back-office admin complet
    films/ seances/ salles/ snacks/ reservations/ utilisateurs/
  api/films/[id]/             — Route API pour upload d'affiche (multipart)

components/
  Header.tsx                  — Navigation principale (conditionnel selon rôle)
  Stepper.tsx                 — Barre de progression du tunnel (6 étapes)
  HeroCarousel.tsx            — Carousel immersif page d'accueil
  FilmsGrid.tsx               — Grille films avec recherche instantanée
  SeatPicker.tsx              — Plan de salle interactif
  ScreeningsList.tsx          — Onglets de dates par film
  FilmForm.tsx                — Formulaire film (création/édition)
  ScreeningForm.tsx           — Formulaire séance
  RoomForm.tsx                — Formulaire salle
  SnackForm.tsx               — Formulaire snack
  SnacksForm.tsx              — Sélection snacks (compteurs quantité)
  PayForm.tsx                 — Formulaire paiement (Stripe/espèces)
  DeleteButton.tsx            — Bouton suppression avec confirmation
  DashNav.tsx                 — Navigation latérale dashboard
  PosterBg.tsx                — Utilitaires styles affiches/backdrops

lib/
  supabase/server.ts          — createClient() + createAdminClient()
  supabase/client.ts          — createBrowserClient() pour 'use client'
  booking.ts                  — Draft cookie (getDraft/setDraft/clearDraft)
  seatmap.ts                  — Génération plan de salle + formatage dates
  types.ts                    — Types TypeScript (Film, Screening, Snack…)

middleware.ts                 — Refresh session SSR + garde /dashboard
supabase/schema.sql           — Schéma PostgreSQL + RLS + seed initial
scripts/seed-screenings.mjs   — Script de seed des séances (utilise .env.local)
```
