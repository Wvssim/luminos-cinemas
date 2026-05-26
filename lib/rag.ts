// lib/rag.ts — Pipeline RAG : Retrieval-Augmented Generation
// Retrieval : TF-IDF cosine similarity (en mémoire, zéro dépendance externe)
// Generation : Groq LLM via @ai-sdk/groq (streamText)

import { KNOWLEDGE_CHUNKS, type Chunk } from './knowledge';

// ─── TF-IDF Retrieval ────────────────────────────────────────────────────────

// Stopwords FR + EN à ignorer lors du calcul TF-IDF
const STOPWORDS = new Set([
  'le','la','les','de','du','des','un','une','et','en','à','au','aux',
  'est','sont','pour','par','sur','dans','avec','il','elle','ils','elles',
  'ce','cette','ces','qui','que','quoi','dont','où','ou','mais','car',
  'the','of','and','in','to','a','is','are','for','by','on','with','it',
  'that','this','was','be','has','have','not','from','at','an','as',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')    // supprime les accents
    .split(/[^a-z0-9]+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  // Normalisation par longueur du document
  for (const [k, v] of tf) tf.set(k, v / tokens.length);
  return tf;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [k, v] of a) {
    dot += v * (b.get(k) ?? 0);
    normA += v * v;
  }
  for (const v of b.values()) normB += v * v;
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Pré-calcul des vecteurs TF pour tous les chunks (fait une seule fois au démarrage du module)
const CHUNK_VECTORS: { chunk: Chunk; tf: Map<string, number> }[] = KNOWLEDGE_CHUNKS.map(
  chunk => ({
    chunk,
    tf: termFrequency(tokenize(`${chunk.title} ${chunk.content}`)),
  })
);

/**
 * Retrouve les k chunks les plus pertinents pour une requête donnée.
 * Retourne les chunks triés par score décroissant.
 */
export function retrieve(query: string, k = 3): Chunk[] {
  const queryTF = termFrequency(tokenize(query));
  return CHUNK_VECTORS
    .map(({ chunk, tf }) => ({ chunk, score: cosineSimilarity(queryTF, tf) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .filter(({ score }) => score > 0)   // exclut les chunks sans aucun mot commun
    .map(({ chunk }) => chunk);
}

/**
 * Construit le prompt système enrichi avec le contexte RAG.
 */
export function buildSystemPrompt(retrievedChunks: Chunk[]): string {
  const context = retrievedChunks.length > 0
    ? retrievedChunks.map(c => `### ${c.title}\n${c.content}`).join('\n\n')
    : 'Aucun contexte spécifique trouvé — réponds avec tes connaissances générales sur la plateforme.';

  return `Tu es l'assistant intelligent de Lumière Cinémas, une plateforme marocaine de réservation de billets de cinéma en ligne.
Tu réponds en français, de façon claire, concise et amicale.
Tu te bases UNIQUEMENT sur le contexte fourni ci-dessous pour répondre.
Si la question dépasse ce contexte, indique poliment que tu ne peux pas répondre sur ce sujet et propose de l'aide sur la plateforme.
Ne mentionne jamais que tu utilises un "contexte" ou une "base de connaissances" — réponds naturellement comme un assistant humain.

--- CONTEXTE ---
${context}
--- FIN DU CONTEXTE ---`;
}
