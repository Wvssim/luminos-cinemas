// Page /dashboard/utilisateurs — Gestion des comptes utilisateurs et des rôles.
// Server Component : utilise deux clients Supabase distincts pour combiner les données :
// - createClient() (anon, RLS) → table profiles (rôles, noms)
// - createAdminClient() (service_role) → auth.admin.listUsers() (emails, dates d'inscription)
import DeleteButton from "@/components/DeleteButton";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { setRole } from "./actions";

// force-dynamic : les rôles peuvent changer depuis cette même page
export const dynamic = "force-dynamic";

export default async function UsersList() {
  const supabase = await createClient();
  // createAdminClient : client Supabase avec service_role, bypass RLS — requis pour auth.admin.listUsers()
  const adminSupabase = createAdminClient();

  // Récupère tous les comptes Supabase Auth (email, date de création, etc.)
  const {
    data: { users: authUsers },
  } = await adminSupabase.auth.admin.listUsers();

  // Récupère les profils étendus (rôle admin/user, nom complet)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  // Fusionne les données Auth + profiles en une seule liste
  // Un utilisateur Auth peut ne pas avoir de profil (si le trigger handle_new_user a échoué)
  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  const rows = (authUsers || [])
    .map((u) => {
      const profile = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email || "",
        full_name: profile?.full_name || "",
        role: profile?.role || "user",           // Défaut 'user' si profil absent
        created_at: profile?.created_at || u.created_at,
      };
    })
    // Tri chronologique inversé (plus récent en premier)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1">
          <em>Utilisateurs</em>
        </h1>
      </div>

      <table className="tbl">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nom</th>
            <th>Rôle</th>
            <th>Inscrit le</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.full_name || "—"}</td>
              <td>
                {/* badge--ok (vert) pour admin, badge--pend (neutre) pour user */}
                <span
                  className={`badge badge--${u.role === "admin" ? "ok" : "pend"}`}
                >
                  {u.role}
                </span>
              </td>
              <td>
                <small style={{ color: "var(--ink-3)" }}>
                  {new Date(u.created_at).toLocaleDateString("fr-FR")}
                </small>
              </td>
              <td style={{ textAlign: "right" }}>
                {/* Bouton contextuel : Retirer admin si l'utilisateur est admin, Promouvoir sinon */}
                {u.role === "admin" ? (
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await setRole(u.id, "user"); // Rétrograde de admin → user
                    }}
                    label="Retirer admin"
                    confirm="Retirer le rôle admin ?"
                  />
                ) : (
                  <DeleteButton
                    action={async () => {
                      "use server";
                      await setRole(u.id, "admin"); // Promeut de user → admin
                    }}
                    label="Promouvoir admin"
                    confirm="Promouvoir en admin ?"
                  />
                )}
              </td>
            </tr>
          ))}
          {(rows || []).length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{ color: "var(--ink-3)", textAlign: "center" }}
              >
                Aucun utilisateur.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
