'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Message = { role: 'user' | 'assistant'; content: string };

// ─── Icônes SVG ──────────────────────────────────────────────────────────────
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4" />
    </svg>
  );
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const WELCOME: Message = {
  role: 'assistant',
  content: "Bonjour 👋 Je suis **Luminos**, ton génie du cinéma ! Pose-moi tes questions sur les réservations, les films, les sièges, les snacks ou les paiements — je suis là pour toi 🎬",
};

const SUGGESTIONS = [
  '🎟️ Comment réserver ?',
  '💺 Prix des sièges ?',
  '🍿 Snacks dispo ?',
  '👨‍💻 Qui a développé ce site ?',
];

// ─── Rendu markdown minimal (gras uniquement) ─────────────────────────────────
function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function ChatBubble() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [unread, setUnread]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!open && messages.length > 1) setUnread(true);
  }, [messages, open]);

  useEffect(() => {
    if (open) { setUnread(false); setTimeout(() => inputRef.current?.focus(), 140); }
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const history: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(history);
    setInput('');
    setLoading(true);
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        content: '⚠️ Impossible de contacter le serveur. Vérifiez votre connexion.',
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          PANNEAU DE CHAT
      ══════════════════════════════════════════════════════════ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Luminos — Génie du Cinéma"
        style={{
          position: 'fixed',
          bottom: '86px',
          right: '22px',
          width: '370px',
          maxWidth: 'calc(100vw - 36px)',
          height: '520px',
          maxHeight: 'calc(100svh - 118px)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          overflow: 'hidden',
          zIndex: 9998,
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.96)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1)',
        }}
      >

        {/* ── En-tête ─────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0e0e11 0%, #1a0608 60%, #260a0d 100%)',
          borderBottom: '1px solid rgba(229,9,20,0.18)',
          padding: '14px 14px 12px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          position: 'relative',
        }}>
          {/* Ligne rouge déco en haut */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          }} />

          {/* Avatar logo */}
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(229,9,20,0.4)',
            overflow: 'hidden',
            padding: '5px',
          }}>
            <Image
              src="/logo.png"
              alt="Luminos"
              width={30}
              height={30}
              style={{ filter: 'invert(1) brightness(2)', objectFit: 'contain' }}
            />
          </div>

          {/* Nom + statut */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#f4efe6', letterSpacing: '0.01em' }}>
              Luminos
            </p>
            <p style={{ margin: '1px 0 0', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {loading ? (
                <span style={{ color: 'var(--accent)' }}>Analyse en cours…</span>
              ) : (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                  <span style={{ color: '#7d7669' }}>Génie du Cinéma · IA Groq</span>
                </>
              )}
            </p>
          </div>

          {/* Bouton effacer */}
          <button
            onClick={() => setMessages([WELCOME])}
            title="Nouvelle conversation"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '5px 7px', color: '#7d7669',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f4efe6'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7d7669'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <IconRefresh /> <span>Reset</span>
          </button>

          {/* Bouton fermer */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Fermer"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '6px', color: '#7d7669',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f4efe6'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7d7669'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <IconX />
          </button>
        </div>

        {/* ── Zone messages ───────────────────────────────────── */}
        <div style={{
          flex: 1, overflowY: 'auto',
          background: '#0a0a0e',
          padding: '16px 12px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          scrollbarWidth: 'thin', scrollbarColor: '#26262e transparent',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}>
              {/* Avatar bot */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: '26px', height: '26px', borderRadius: '8px',
                  background: 'var(--accent)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '3px', marginBottom: '2px',
                }}>
                  <Image src="/logo.png" alt="" width={20} height={20}
                    style={{ filter: 'invert(1) brightness(2)', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Bulle */}
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user'
                  ? '16px 16px 3px 16px'
                  : '16px 16px 16px 3px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #E50914, #c4000f)'
                  : '#15151a',
                color: '#f4efe6',
                fontSize: '13.5px',
                lineHeight: '1.6',
                wordBreak: 'break-word',
                boxShadow: msg.role === 'user'
                  ? '0 4px 16px rgba(229,9,20,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.3)',
                border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '8px',
                background: 'var(--accent)', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '3px',
              }}>
                <Image src="/logo.png" alt="" width={20} height={20}
                  style={{ filter: 'invert(1) brightness(2)', objectFit: 'contain' }}
                />
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: '16px 16px 16px 3px',
                background: '#15151a', border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', gap: '5px', alignItems: 'center',
              }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#4a463e', display: 'inline-block',
                    animation: 'lmBounce 1.3s ease-in-out infinite',
                    animationDelay: `${i * 0.17}s`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Suggestions rapides ─────────────────────────────── */}
        {messages.length === 1 && !loading && (
          <div style={{
            background: '#0a0a0e',
            padding: '2px 10px 10px',
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            flexShrink: 0,
          }}>
            {SUGGESTIONS.map(q => (
              <button key={q} onClick={() => send(q)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(229,9,20,0.25)',
                  borderRadius: '20px', padding: '5px 12px',
                  fontSize: '11.5px', color: '#c9c2b4',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(229,9,20,0.1)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = '#f4efe6';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(229,9,20,0.25)';
                  e.currentTarget.style.color = '#c9c2b4';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* ── Input ───────────────────────────────────────────── */}
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          style={{
            display: 'flex', gap: '8px', padding: '10px 12px 12px',
            background: '#0e0e11',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Pose ta question à Luminos…"
            disabled={loading}
            autoComplete="off"
            style={{
              flex: 1,
              background: '#15151a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              padding: '9px 14px',
              color: '#f4efe6',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'rgba(229,9,20,0.5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
            style={{
              width: 38, height: 38, borderRadius: '12px', border: 'none',
              background: loading || !input.trim()
                ? '#1c1c22'
                : 'linear-gradient(135deg, #E50914, #c4000f)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() ? 0.45 : 1,
              transition: 'all 0.15s',
              boxShadow: loading || !input.trim() ? 'none' : '0 4px 14px rgba(229,9,20,0.4)',
            }}
          >
            <IconSend />
          </button>
        </form>

        {/* Branding footer */}
        <div style={{
          background: '#0e0e11',
          padding: '5px 12px 8px',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '10px', color: '#4a463e' }}>
            Luminos · Lumière Cinémas · Propulsé par Groq
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          BOUTON FLOTTANT
      ══════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Fermer Luminos" : "Ouvrir Luminos — Génie du Cinéma"}
        style={{
          position: 'fixed', bottom: '22px', right: '22px',
          width: 56, height: 56, borderRadius: '16px',
          background: open
            ? '#1c1c22'
            : 'linear-gradient(135deg, #E50914 0%, #c4000f 100%)',
          border: open ? '1px solid rgba(255,255,255,0.08)' : 'none',
          color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? 'none' : '0 8px 28px rgba(229,9,20,0.55), 0 2px 8px rgba(0,0,0,0.5)',
          zIndex: 9999, cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
          padding: open ? '0' : '10px',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1) translateY(0)')}
      >
        {open ? (
          <IconX />
        ) : (
          <Image
            src="/logo.png"
            alt="Luminos"
            width={36}
            height={36}
            style={{ filter: 'invert(1) brightness(2)', objectFit: 'contain' }}
          />
        )}

        {/* Badge non-lu */}
        {unread && !open && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 12, height: 12, background: '#22c55e',
            borderRadius: '50%', border: '2px solid #08080a',
            boxShadow: '0 0 8px #22c55e',
          }} />
        )}
      </button>

      {/* Keyframes */}
      <style>{`
        @keyframes lmBounce {
          0%,80%,100% { transform:scale(1);   opacity:.35; }
          40%          { transform:scale(1.5); opacity:1;   }
        }
      `}</style>
    </>
  );
}
