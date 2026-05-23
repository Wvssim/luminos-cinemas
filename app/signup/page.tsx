// Page /signup — Formulaire de création de compte utilisateur.
// Server Component : affiche le formulaire d'inscription avec gestion des erreurs.
// La soumission est gérée par la Server Action `signup` (app/auth/actions.ts).
// À la création, un trigger Supabase handle_new_user() crée automatiquement un profil.
import Link from 'next/link';
import Header from '@/components/Header';
import { signup } from '@/app/auth/actions';

export default async function SignupPage({
  searchParams,
}: {
  // error : message d'erreur Supabase Auth (ex: "User already registered")
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <>
      <Header />
      <div className="auth">
        <div className="auth__box">
          <h1 className="auth__h">Rejoindre <em>Lumière</em></h1>
          <p className="auth__sub">Créer un compte</p>

          {/* Bannière d'erreur : affichée si l'inscription échoue (email déjà utilisé, etc.) */}
          {sp.error && <div className="auth__err">{sp.error}</div>}

          {/* action={signup} : soumet le formulaire via Server Action */}
          <form action={signup} className="form">
            <div className="form__field">
              <label>Nom complet</label>
              {/* fullName : transmis à Supabase Auth comme métadonnée user_metadata.full_name */}
              <input name="fullName" required />
            </div>
            <div className="form__field">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form__field">
              <label>Mot de passe</label>
              {/* minLength=6 : contrainte Supabase Auth par défaut */}
              <input type="password" name="password" required minLength={6} />
            </div>
            <button type="submit" className="btn btn--primary" style={{ marginTop: 8 }}>Créer mon compte →</button>
          </form>

          {/* Lien vers la page de connexion pour les utilisateurs déjà inscrits */}
          <p className="auth__alt">
            Déjà inscrit ? <Link href="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </>
  );
}
