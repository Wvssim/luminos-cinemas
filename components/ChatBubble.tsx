'use client';

import { useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

// ─── Icônes SVG inline ───────────────────────────────────────────────────────

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

const WELCOME: Message = {
  role: 'assistant',
  content: "Bonjour 👋 Je suis l'assistant Lumière Cinémas. Posez-moi vos questions sur les réservations, les films, les sièges, les snacks ou les paiements.",
};

const SUGGESTIONS = [
  'Comment réserver un billet ?',
  'Prix des sièges ?',
  'Snacks disponibles ?',
  'Paiement en ligne sécurisé ?',
];

export default function ChatBubble() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll vers le bas après chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!open && messages.length > 1) setHasUnread(true);
  }, [messages, open]);

  // Focus l'input à l'ouverture
  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // On n'envoie que les 6 derniers échanges pour rester dans la fenêtre de contexte
        body: JSON.stringify({ messages: history.slice(-6) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply ?? data.error ?? 'Une erreur est survenue.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleReset() {
    setMessages([WELCOME]);
    setInput('');
  }

  return (
    <>
      {/* ── Panneau de chat ────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assistant Lumière Cinémas"
        style={{
          position: 'fixed',
          bottom: '88px',
          right: '24px',
          width: '358px',
          maxWidth: 'calc(100vw - 40px)',
          height: '490px',
          maxHeight: 'calc(100svh - 120px)',
          background: 'var(--bg-2)',
          border: '1px solid var(--line-2)',
          borderRadius: '18px',
          boxShadow: '0 28px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(229,9,20,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9998,
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* En-tête */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '13px 14px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-3)',
          flexShrink: 0,
        }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, var(--accent) 0%, #ff6b35 100%)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: '#fff',
          }}>
            <IconSpark />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '13.5px', color: 'var(--ink)' }}>
              Assistant Lumière
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: loading ? 'var(--accent)' : 'var(--ink-3)' }}>
              {loading
                ? 'Analyse en cours…'
                : <><span style={{ display: 'inline-block', width: 6, height: 6, background: '#22c55e', borderRadius: '50%', marginRight: 4, verticalAlign: 'middle' }} />IA · Groq · RAG</>
              }
            </p>
          </div>
          <button onClick={handleReset} title="Nouvelle conversation" style={btnTextStyle}>
            Effacer
          </button>
          <button onClick={() => setOpen(false)} aria-label="Fermer" style={btnIconStyle}>
            <IconX />
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '14px 12px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          scrollbarWidth: 'thin', scrollbarColor: 'var(--bg-4) transparent',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '84%',
                padding: '9px 13px',
                borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-4)',
                color: 'var(--ink)',
                fontSize: '13px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indicateur typing */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '10px 14px', borderRadius: '14px 14px 14px 3px',
                background: 'var(--bg-4)', display: 'flex', gap: '4px', alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-3)',
                    animation: 'lmTyping 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.18}s`,
                    display: 'inline-block',
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions rapides — visibles seulement sur le message de bienvenue */}
        {messages.length === 1 && !loading && (
          <div style={{
            padding: '0 10px 8px',
            display: 'flex', flexWrap: 'wrap', gap: '5px', flexShrink: 0,
          }}>
            {SUGGESTIONS.map(q => (
              <button key={q} onClick={() => send(q)} style={chipStyle}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex', gap: '7px', padding: '11px',
          borderTop: '1px solid var(--line)', background: 'var(--bg-3)', flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Votre question…"
            disabled={loading}
            autoComplete="off"
            style={{
              flex: 1, background: 'var(--bg-4)',
              border: '1px solid var(--line-2)', borderRadius: '10px',
              padding: '8px 13px', color: 'var(--ink)', fontSize: '13px',
              outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--line-2)')}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
            style={{
              width: 36, height: 36, borderRadius: '10px',
              background: loading || !input.trim() ? 'var(--bg-4)' : 'var(--accent)',
              border: 'none', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() ? 0.4 : 1,
              transition: 'background 0.15s, opacity 0.15s',
            }}
          >
            <IconSend />
          </button>
        </form>
      </div>

      {/* ── Bouton flottant ────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant Lumière Cinémas"}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: 54, height: 54, borderRadius: '50%',
          background: open ? 'var(--bg-3)' : 'var(--accent)',
          border: open ? '1px solid var(--line-2)' : 'none',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? 'none' : '0 8px 28px rgba(229,9,20,0.5)',
          zIndex: 9999, cursor: 'pointer',
          transition: 'background 0.2s, box-shadow 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.09)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? <IconX /> : <IconChat />}
        {hasUnread && !open && (
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 9, height: 9, background: '#22c55e',
            borderRadius: '50%', border: '2px solid var(--bg)',
          }} />
        )}
      </button>

      {/* Keyframes typing */}
      <style>{`
        @keyframes lmTyping {
          0%,80%,100% { transform:translateY(0); opacity:.35; }
          40%         { transform:translateY(-5px); opacity:1; }
        }
      `}</style>
    </>
  );
}

// ─── Styles partagés ─────────────────────────────────────────────────────────

const btnTextStyle: React.CSSProperties = {
  background: 'none', border: 'none', padding: '3px 7px',
  color: 'var(--ink-3)', fontSize: '11px', cursor: 'pointer',
  borderRadius: '4px', transition: 'color 0.15s',
};
const btnIconStyle: React.CSSProperties = {
  background: 'none', border: 'none', padding: '3px',
  color: 'var(--ink-3)', cursor: 'pointer', borderRadius: '4px',
  display: 'flex', alignItems: 'center', transition: 'color 0.15s',
};
const chipStyle: React.CSSProperties = {
  background: 'var(--bg-4)', border: '1px solid var(--line-2)',
  borderRadius: '20px', padding: '4px 11px',
  fontSize: '11.5px', color: 'var(--ink-2)',
  cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
};
