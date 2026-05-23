// Page /dashboard/snacks — Liste des snacks disponibles à la commande.
// Server Component : charge tous les snacks triés par prix et affiche le tableau de gestion.
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import { createClient } from '@/lib/supabase/server';
import { deleteSnack } from './actions';

// force-dynamic : la liste évolue après ajout/suppression de snacks
export const dynamic = 'force-dynamic';

export default async function SnacksList() {
  const supabase = await createClient();
  // Triés par prix croissant — cohérent avec l'affichage côté public
  const { data: rows } = await supabase.from('snacks').select('*').order('price');

  return (
    <>
      <div className="dash__head">
        <h1 className="dash__h1"><em>Snacks</em></h1>
        <Link href="/dashboard/snacks/new" className="btn btn--primary">+ Nouveau snack</Link>
      </div>

      <table className="tbl">
        <thead><tr>
          {/* Colonne emoji sans header — visuel rapide pour identifier l'article */}
          <th></th><th>ID</th><th>Nom</th><th>Format</th><th>Prix</th><th></th>
        </tr></thead>
        <tbody>
          {(rows || []).map((s) => (
            <tr key={s.id}>
              {/* Emoji du snack en grande taille pour identification visuelle immédiate */}
              <td style={{ fontSize: 22 }}>{s.emoji}</td>
              {/* UUID du snack — lien vers la page d'édition */}
              <td><Link href={`/dashboard/snacks/${s.id}`}><code>{s.id}</code></Link></td>
              <td>{s.name}</td>
              <td>{s.size}</td>
              <td className="is-num">{Number(s.price).toFixed(2)} MAD</td>
              <td style={{ textAlign: 'right' }}>
                {/* deleteSnack : supprime le snack de la boutique */}
                <DeleteButton action={async () => { 'use server'; await deleteSnack(s.id); }} />
              </td>
            </tr>
          ))}
          {(rows || []).length === 0 && (
            <tr><td colSpan={6} style={{ color: 'var(--ink-3)', textAlign: 'center' }}>Aucun snack.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}
