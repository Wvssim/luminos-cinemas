// Re-export de updateFilm pour la page d'édition de film — nécessaire car
// les Server Actions référencées dans des composants client doivent être dans un fichier 'use server'.
'use server';

import { updateFilm } from '../actions';

// handleUpdateFilm : proxy vers updateFilm(id, fd) depuis la page /dashboard/films/[id]
// Le .bind(null, id) dans la page lie l'ID au premier argument avant la soumission.
export async function handleUpdateFilm(id: string, fd: FormData) {
  await updateFilm(id, fd);
}
