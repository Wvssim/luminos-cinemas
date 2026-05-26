// app/api/chat/route.ts — Endpoint RAG
// Pipeline : requête utilisateur → retrieval TF-IDF → prompt enrichi → Groq → JSON

import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { retrieve, buildSystemPrompt } from '@/lib/rag';

export const runtime = 'nodejs';

type Message = { role: 'user' | 'assistant'; content: string };

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: 'GROQ_API_KEY manquante — ajoutez-la dans .env.local' },
      { status: 500 }
    );
  }

  const { messages }: { messages: Message[] } = await req.json();
  const lastUser = [...messages].reverse().find(m => m.role === 'user');
  const query = lastUser?.content ?? '';

  // Étape 1 — Retrieval : top-3 chunks pertinents (TF-IDF cosine similarity)
  const relevant = retrieve(query, 3);

  // Étape 2 — Augmentation : prompt système enrichi avec le contexte RAG
  const systemPrompt = buildSystemPrompt(relevant);

  // Étape 3 — Generation : appel Groq LLM (llama-3.1-8b-instant, free tier)
  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  const { text } = await generateText({
    model: groq('llama-3.1-8b-instant'),
    system: systemPrompt,
    messages,
    temperature: 0.4,
    maxOutputTokens: 512,
  });

  return Response.json({ reply: text });
}
