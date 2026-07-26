import React, { useMemo, useState, useEffect, useRef } from 'react';

/* ─── Keyframe animations injected once ─── */
const styleSheet = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.85); }
    70%  { transform: scale(1.04); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  @keyframes scoreGrow {
    from { stroke-dashoffset: 283; }
  }
  @keyframes barGrow {
    from { width: 0%; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .fade-up   { animation: fadeInUp 0.45s ease both; }
  .slide-in  { animation: slideInRight 0.4s ease both; }
  .pop-in    { animation: popIn 0.35s cubic-bezier(.17,.67,.35,1.1) both; }

  .btn-primary {
    background: linear-gradient(135deg,#3b82f6,#6366f1);
    color: #fff;
    border: none;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
  }
  .btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,.35); filter: brightness(1.08); }
  .btn-primary:active { transform: scale(0.97); }

  .btn-ghost {
    background: transparent;
    border: 1.5px solid #334155;
    color: #94a3b8;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;
  }
  .btn-ghost:hover  { background: #1e293b; border-color: #64748b; color: #e2e8f0; transform: translateY(-1px); }
  .btn-ghost:active { transform: scale(0.97); }

  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,.35);
  }

  .nav-link {
    transition: color 0.15s, background 0.15s;
  }
  .nav-link:hover { color: #e2e8f0 !important; background: rgba(255,255,255,.06); border-radius: 10px; }

  .input-field {
    width: 100%; padding: 12px 16px;
    background: #0f172a; border: 1.5px solid #1e293b;
    border-radius: 14px; color: #e2e8f0; font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none; box-sizing: border-box;
  }
  .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.2); }

  .score-ring { animation: scoreGrow 1.2s cubic-bezier(.4,0,.2,1) forwards; }
  .bar-grow   { animation: barGrow 0.8s cubic-bezier(.4,0,.2,1) forwards; }

  .tag {
    display: inline-block; padding: 3px 10px;
    border-radius: 20px; font-size: 11px; font-weight: 600;
    letter-spacing: .4px;
  }

  .shimmer-bg {
    background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

  /* ── AI Chat Assistant ── */
  @keyframes chatSlideIn {
    from { opacity: 0; transform: translateX(100%) scale(0.96); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes chatSlideOut {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to   { opacity: 0; transform: translateX(100%) scale(0.96); }
  }
  @keyframes typingDot {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%            { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes msgFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes orbFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(6px, -8px) scale(1.05); }
    66%       { transform: translate(-4px, 4px) scale(0.97); }
  }

  .ai-fab {
    position: fixed; bottom: 28px; right: 28px; z-index: 900;
    width: 54px; height: 54px; border-radius: 50%;
    background: transparent;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 38px; line-height: 1;
    transition: transform 0.2s cubic-bezier(.17,.67,.35,1.2), filter 0.2s;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
  }
  .ai-fab:hover  { transform: scale(1.18) rotate(-6deg); filter: drop-shadow(0 6px 18px rgba(0,0,0,0.6)); }
  .ai-fab:active { transform: scale(0.93); }

  .chat-panel {
    position: fixed; bottom: 0; right: 0; z-index: 850;
    width: 26%; min-width: 320px; max-width: 420px;
    height: 100vh;
    background: #020b18;
    border-left: 1px solid #1e293b;
    display: flex; flex-direction: column;
    animation: chatSlideIn 0.38s cubic-bezier(.17,.67,.35,1.1) both;
    box-shadow: -12px 0 60px rgba(0,0,0,0.6);
  }
  .chat-panel.closing {
    animation: chatSlideOut 0.3s cubic-bezier(.4,0,.2,1) both;
  }

  .chat-msg { animation: msgFadeUp 0.3s ease both; }

  .typing-dot {
    display: inline-block; width: 6px; height: 6px;
    border-radius: 50%; background: #6366f1; margin: 0 2px;
  }
  .typing-dot:nth-child(1) { animation: typingDot 1.2s ease infinite 0s; }
  .typing-dot:nth-child(2) { animation: typingDot 1.2s ease infinite 0.2s; }
  .typing-dot:nth-child(3) { animation: typingDot 1.2s ease infinite 0.4s; }

  .chat-input-field {
    flex: 1; background: transparent; border: none; outline: none;
    color: #e2e8f0; font-size: 13.5px; resize: none;
    font-family: inherit; line-height: 1.5;
    max-height: 100px; overflow-y: auto;
  }
  .chat-send-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg,#6366f1,#8b5cf6);
    border: none; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    transition: transform 0.15s, filter 0.15s, opacity 0.15s;
    flex-shrink: 0;
  }
  .chat-send-btn:hover:not(:disabled) { transform: scale(1.1); filter: brightness(1.15); }
  .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .chat-suggestion {
    background: #0f172a; border: 1px solid #1e293b;
    border-radius: 20px; padding: 6px 14px;
    font-size: 11.5px; color: #94a3b8; cursor: pointer;
    transition: all 0.15s; white-space: nowrap;
    flex-shrink: 0;
  }
  .chat-suggestion:hover { background: #1e293b; border-color: #6366f1; color: #a5b4fc; }

  .orb {
    position: absolute; border-radius: 50%; pointer-events: none;
    animation: orbFloat 8s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    .chat-panel { width: 100% !important; max-width: 100% !important; }
    .ai-fab { bottom: 20px; right: 20px; }
  }

  /* ── Kanban tracker ── */
  .kanban-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: start; }
  @media (max-width: 900px) { .kanban-board { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 540px) { .kanban-board { grid-template-columns: 1fr; } }

  .kanban-col {
    border-radius: 16px; border: 1px solid #1e293b;
    background: #030d1c; min-height: 220px; padding: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .kanban-col.drag-over {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.25);
  }
  .kanban-card {
    background: #0a1628; border: 1px solid #1e293b;
    border-radius: 12px; padding: 12px 13px; margin-bottom: 10px;
    cursor: grab; transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    user-select: none;
  }
  .kanban-card:last-child { margin-bottom: 0; }
  .kanban-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.4); border-color: #334155; }
  .kanban-card.dragging { opacity: 0.35; transform: scale(0.97); cursor: grabbing; }

  @keyframes cardDrop {
    from { opacity: 0; transform: translateY(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .card-drop { animation: cardDrop 0.25s ease both; }

  .stage-select {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 8px;
    color: #94a3b8; font-size: 11px; padding: 3px 7px; cursor: pointer;
    transition: border-color 0.15s;
  }
  .stage-select:hover { border-color: #6366f1; }

  /* ── Vertical Sidebar Nav ── */
  @keyframes sidebarIn {
    from { opacity: 0; transform: translateX(-100%); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes sidebarOut {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-100%); }
  }
  .sidebar-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
    animation: fadeIn 0.2s ease both;
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  .sidebar-panel {
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 201;
    width: 260px; background: #030b18;
    border-right: 1px solid #1e293b;
    display: flex; flex-direction: column;
    box-shadow: 8px 0 40px rgba(0,0,0,0.6);
    animation: sidebarIn 0.3s cubic-bezier(.17,.67,.35,1.1) both;
    overflow-y: auto;
  }
  .sidebar-panel.closing {
    animation: sidebarOut 0.25s ease both;
  }
  .sidebar-nav-item {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 20px; border: none; background: none;
    color: #64748b; font-size: 13.5px; cursor: pointer;
    text-align: left; width: 100%; border-radius: 0;
    transition: background 0.15s, color 0.15s;
    font-family: inherit;
  }
  .sidebar-nav-item:hover { background: rgba(99,102,241,0.08); color: #e2e8f0; }
  .sidebar-nav-item.active { background: rgba(99,102,241,0.15); color: #818cf8; font-weight: 600; }
  .sidebar-nav-item .nav-icon { font-size: 17px; width: 22px; flex-shrink: 0; text-align: center; }
  .sidebar-divider { height: 1px; background: #1e293b; margin: 8px 16px; }

  /* ── Responsive nav ── */
  .nav-desktop { display: flex; align-items: center; gap: 4px; flex: 1; overflow: hidden; }
  .nav-hamburger { display: none; background: none; border: 1px solid #1e293b; color: #94a3b8; cursor: pointer; border-radius: 8px; padding: 6px 9px; font-size: 18px; line-height: 1; flex-shrink: 0; }
  .nav-drawer {
    position: fixed; top: 60px; left: 0; right: 0; z-index: 99;
    background: rgba(2,8,23,0.98); backdrop-filter: blur(16px);
    border-bottom: 1px solid #1e293b;
    padding: 12px 16px 16px;
    display: flex; flex-direction: column; gap: 4px;
    animation: chatSlideIn 0.22s ease both;
  }
  .nav-drawer button { text-align: left; }

  @media (max-width: 1080px) {
    .nav-desktop { display: none !important; }
    .nav-hamburger { display: block !important; }
  }
`;

/* ─── Helpers ─── */
const card = {
  background: '#0f172a',
  border: '1.5px solid #1e293b',
  borderRadius: '20px',
  padding: '24px',
};

function AnimatedCard({ children, style = {}, delay = 0, className = '' }) {
  return (
    <div
      className={`fade-up card-hover ${className}`}
      style={{ ...card, ...style, animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue:   { bg: '#1e3a5f', text: '#60a5fa' },
    green:  { bg: '#14532d', text: '#4ade80' },
    purple: { bg: '#2e1065', text: '#a78bfa' },
    amber:  { bg: '#451a03', text: '#fbbf24' },
    red:    { bg: '#450a0a', text: '#f87171' },
    slate:  { bg: '#1e293b', text: '#94a3b8' },
  };
  const c = colors[color] || colors.blue;
  return (
    <span className="tag" style={{ background: c.bg, color: c.text }}>
      {children}
    </span>
  );
}



/* ─── Circular Score Ring ─── */
function ScoreRing({ score, size = 100, color = '#6366f1' }) {
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        className="score-ring"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
      />
      <text x="50" y="54" textAnchor="middle" fill="#e2e8f0" fontSize="18" fontWeight="700">{score}</text>
    </svg>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ label, value, color = '#6366f1', delay = 0 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>{label}</span>
        <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ background: '#1e293b', borderRadius: 100, height: 6, overflow: 'hidden' }}>
        <div
          className="bar-grow"
          style={{
            height: '100%', borderRadius: 100,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            width: `${value}%`,
            animationDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ─── AI CHAT ASSISTANT ─── */
function AIChatAssistant() {
  const [open, setOpen]         = useState(false);
  const [closing, setClosing]   = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const messagesEndRef           = useRef(null);
  const textareaRef              = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const closePanel = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 300);
  };

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8096,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || '').join('') || "Sorry, I couldn't get a response. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Please check your connection and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Render markdown: bold, bullets, code, headers
  const renderMessage = (content) => {
    return content.split('\n').map((line, i) => {
      // Inline bold + code
      const processInline = (text) => {
        const parts = [];
        const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
        let last = 0, match;
        while ((match = regex.exec(text)) !== null) {
          if (match.index > last) parts.push(text.slice(last, match.index));
          if (match[0].startsWith('`')) {
            parts.push(<code key={match.index} style={{ background: '#1e293b', borderRadius: 4, padding: '1px 5px', fontSize: 12, fontFamily: 'monospace', color: '#7dd3fc' }}>{match[0].slice(1, -1)}</code>);
          } else {
            parts.push(<strong key={match.index}>{match[0].slice(2, -2)}</strong>);
          }
          last = match.index + match[0].length;
        }
        if (last < text.length) parts.push(text.slice(last));
        return parts;
      };

      if (/^#{1,3}\s/.test(line)) {
        const text = line.replace(/^#+\s/, '');
        return <div key={i} style={{ fontWeight: 700, fontSize: 13.5, color: '#e2e8f0', margin: '10px 0 4px' }}>{processInline(text)}</div>;
      }
      if (/^(\*|-|\d+\.)\s/.test(line)) {
        const text = line.replace(/^(\*|-|\d+\.)\s/, '');
        return <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 3, alignItems: 'flex-start' }}>
          <span style={{ color: '#818cf8', flexShrink: 0, marginTop: 2, fontSize: 10 }}>◆</span>
          <span style={{ lineHeight: 1.6 }}>{processInline(text)}</span>
        </div>;
      }
      return line
        ? <p key={i} style={{ margin: '0 0 5px', lineHeight: 1.65 }}>{processInline(line)}</p>
        : <div key={i} style={{ height: 6 }} />;
    });
  };

  return (
    <>
      {/* ── 🤖 Floating Button — hidden when panel is open ── */}
      {!open && (
        <button
          className="ai-fab"
          onClick={() => setOpen(true)}
          title="Open Claude AI"
          aria-label="Open Claude AI Assistant"
        >
          🤖
        </button>
      )}

      {/* ── Chat Panel ── */}
      {open && (
        <div className={`chat-panel${closing ? ' closing' : ''}`} role="dialog" aria-label="Claude AI Assistant">
          {/* Subtle background orbs */}
          <div className="orb" style={{ width: 200, height: 200, top: -60, right: -70, background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', animationDuration: '11s' }} />
          <div className="orb" style={{ width: 140, height: 140, bottom: 100, left: -40, background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', animationDuration: '8s', animationDelay: '3s' }} />

          {/* ── Header ── */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #0f172a', flexShrink: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>🤖</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', letterSpacing: '-0.3px' }}>Claude AI</div>
                <div style={{ fontSize: 11, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                  <span style={{ width: 5, height: 5, background: '#4ade80', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
                  Online · Anthropic
                </div>
              </div>
              {/* Clear chat */}
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  title="Clear chat"
                  style={{ background: 'none', border: '1px solid #1e293b', color: '#475569', cursor: 'pointer', borderRadius: 7, padding: '4px 8px', fontSize: 11, transition: 'all .15s', marginRight: 4 }}
                  onMouseOver={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}
                  onMouseOut={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#1e293b'; }}
                >
                  Clear
                </button>
              )}
              {/* Close → restores 🤖 FAB */}
              <button
                onClick={closePanel}
                title="Close"
                style={{ background: '#0f172a', border: '1px solid #1e293b', color: '#64748b', cursor: 'pointer', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}
                onMouseOver={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = '#334155'; }}
                onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#1e293b'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 6px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#334155' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#475569', marginBottom: 6 }}>How can I help you?</div>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>Ask me anything — I'm the full Claude AI with no restrictions.</div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="chat-msg"
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: 8, marginBottom: 12,
                  animationDelay: `${Math.min(idx, 5) * 40}ms`,
                }}
              >
                {msg.role === 'assistant' && (
                  <span style={{ fontSize: 20, flexShrink: 0, marginTop: 4, lineHeight: 1 }}>🤖</span>
                )}
                <div style={{
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#0d1929',
                  border: msg.role === 'user' ? 'none' : '1px solid #1a2744',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  padding: '10px 13px',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#cbd5e1',
                  wordBreak: 'break-word',
                }}>
                  {msg.role === 'assistant' ? renderMessage(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* Typing dots */}
            {loading && (
              <div className="chat-msg" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1, marginTop: 4 }}>🤖</span>
                <div style={{ background: '#0d1929', border: '1px solid #1a2744', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div style={{ padding: '8px 12px 14px', borderTop: '1px solid #0a1525', flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 8,
              background: '#0d1929', border: '1.5px solid #1a2744',
              borderRadius: 14, padding: '8px 10px',
              transition: 'border-color 0.2s',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlurCapture={e => e.currentTarget.style.borderColor = '#1a2744'}
            >
              <textarea
                ref={textareaRef}
                className="chat-input-field"
                placeholder="Message Claude…"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
                style={{ placeholder: 'color: #334155' }}
              />
              <button
                className="chat-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                title="Send (Enter)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: 10, color: '#1e293b', marginTop: 6 }}>
              Shift+Enter for new line · Powered by Anthropic Claude
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── MAIN APP ─── */
export default function GlobalPortV2() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('Free Plan');
  const [paid, setPaid] = useState(false);
  const [resume, setResume] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gp_saved') || '[]'); } catch { return []; }
  });
  const [applied, setApplied] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gp_applied') || '[]'); } catch { return []; }
  });

  useEffect(() => { try { localStorage.setItem('gp_saved', JSON.stringify(saved)); } catch {} }, [saved]);
  useEffect(() => { try { localStorage.setItem('gp_applied', JSON.stringify(applied)); } catch {} }, [applied]);

  /* ── Application Tracker (Kanban) ── */
  const KANBAN_COLS = [
    { id: 'applied',      label: 'Applied',      emoji: '📨', color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
    { id: 'shortlisted',  label: 'Shortlisted',  emoji: '⭐', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
    { id: 'interview',    label: 'Interview',    emoji: '🎙️', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)'  },
    { id: 'offer',        label: 'Offer',        emoji: '🎉', color: '#4ade80', bg: 'rgba(74,222,128,0.08)'  },
  ];
  const [cardStages, setCardStages] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gp_stages') || '{}'); } catch { return {}; }
  });
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverCol, setDragOverCol]   = useState(null);

  useEffect(() => {
    try { localStorage.setItem('gp_stages', JSON.stringify(cardStages)); } catch {}
  }, [cardStages]);

  const getStage = (jobId) => cardStages[jobId] || 'applied';

  const moveCard = (jobId, toCol) => {
    setCardStages(prev => ({ ...prev, [jobId]: toCol }));
  };

  const removeFromTracker = (jobId) => {
    setApplied(prev => prev.filter(id => id !== jobId));
    setCardStages(prev => { const next = { ...prev }; delete next[jobId]; return next; });
  };
  const [addons, setAddons] = useState([]);
  const [following, setFollowing] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [billing] = useState([
    { id: 1, item: 'Pro Plan', amount: '₹499', date: '2026-04-25', status: 'Paid' },
    { id: 2, item: 'Pro Annual Plan', amount: '₹3999', date: '2026-03-10', status: 'Paid' },
    { id: 3, item: 'Recruiter Annual Plan', amount: '₹8999', date: '2026-02-18', status: 'Paid' },
  ]);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [uploadName, setUploadName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [postedJobs, setPostedJobs] = useState([
    { id: 1, title: 'Frontend Developer', apps: 12 },
    { id: 2, title: 'Java Engineer', apps: 8 },
  ]);
  const [candidates] = useState([
    { name: 'Rahul', score: 92 },
    { name: 'Aisha', score: 88 },
    { name: 'David', score: 84 },
  ]);
  const [users] = useState(10452);
  const [revenue] = useState('₹8.4L');
  const [pendingRecruiters] = useState(['TechNova Pvt Ltd', 'BlueHire Agency']);

  const [toasts, setToasts] = useState([]);

  /* ── Interview Scheduler state ── */
  const [interviews, setInterviews] = useState([
    { id: 1, company: 'SkyLabs', role: 'React Engineer', date: '2026-05-02', time: '10:00', type: 'Video', status: 'Confirmed' },
    { id: 2, company: 'Orbit', role: 'Cloud Architect', date: '2026-05-05', time: '14:30', type: 'Phone', status: 'Pending' },
    { id: 3, company: 'NovaTech', role: 'Sr Java Dev', date: '2026-05-08', time: '11:00', type: 'Onsite', status: 'Confirmed' },
  ]);
  const [newInterview, setNewInterview] = useState({ company: '', role: '', date: '', time: '', type: 'Video' });
  const [interviewFilter, setInterviewFilter] = useState('All');

  /* ── Resume Analyzer state ── */
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  /* ── AI Recommendations state ── */
  const [aiLoading, setAiLoading] = useState(false);
  const [aiJobs, setAiJobs] = useState([]);
  const [aiPrefs, setAiPrefs] = useState({ role: '', location: '', sector: 'All', visa: 'Yes' });

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobFilters, setJobFilters] = useState({ title: '', company: '', country: '', sector: 'All', visa: 'All', salaryBand: 'All' });
  const [jobSort, setJobSort] = useState('default');
  const [jobPage, setJobPage] = useState(1);
  const JOBS_PER_PAGE = 20;

  // Scroll lock + Escape key when job modal is open
  useEffect(() => {
    if (selectedJob) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => { if (e.key === 'Escape') setSelectedJob(null); };
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [selectedJob]);

  const SECTORS = ['All','IT','Medical','Chemical','Aerospace','Finance','Marketing','Banking','Engineering','Labour','BPO','Admin','Hospitality','Education','HR','Logistics'];

  const JOBS = [
    { id:1,  title:'Senior Java Developer',        company:'NovaTech Solutions',     companyAbout:'NovaTech is a leading software firm in Frankfurt specializing in enterprise banking apps with 2,000+ employees across Europe.',              state:'Bavaria',                country:'Germany',      salary:'€75,000–€90,000',       visa:true,  sector:'IT',          type:'Full-time', tags:['Java','Spring Boot','AWS'],             roles:['Design microservices','Lead code reviews','CI/CD pipelines','Mentor junior devs'],             desc:'We are looking for a Senior Java Developer to join our Frankfurt engineering team building high-performance microservices for Europe\'s top banking clients.' },
    { id:2,  title:'React Frontend Engineer',      company:'SkyLabs Inc.',            companyAbout:'SkyLabs is a Toronto-based SaaS startup building next-gen HR platforms used by 500+ companies globally.',                                  state:'Ontario',                country:'Canada',       salary:'CAD 95,000–115,000',    visa:true,  sector:'IT',          type:'Full-time', tags:['React','TypeScript','Node.js'],         roles:['Build UI components','Optimize performance','Collaborate with designers','API integration'],     desc:'Join SkyLabs to craft beautiful high-performance UIs for our HR SaaS platform used by companies worldwide.' },
    { id:3,  title:'Cloud Architect',              company:'Orbit Systems',           companyAbout:'Orbit Systems is a Dubai-headquartered cloud consultancy serving government and enterprise clients across the GCC region.',                 state:'Dubai',                  country:'UAE',          salary:'AED 18,000–24,000/mo',  visa:true,  sector:'IT',          type:'Full-time', tags:['AWS','Terraform','Docker','K8s'],        roles:['Design cloud infra','Cost optimization','Security compliance','Team leadership'],                  desc:'Orbit is hiring a Cloud Architect to lead end-to-end cloud transformation projects for GCC enterprise and government clients.' },
    { id:4,  title:'Backend Engineer',             company:'PrimeSoft UK',            companyAbout:'PrimeSoft is a Manchester-based fintech firm offering payment gateway solutions across 40+ countries.',                                    state:'England',                country:'UK',           salary:'£60,000–£75,000',       visa:true,  sector:'IT',          type:'Full-time', tags:['Node.js','PostgreSQL','Redis'],         roles:['REST API development','Database optimization','Security hardening','Code reviews'],               desc:'PrimeSoft is looking for a Backend Engineer to scale our payment infrastructure to 100M+ transactions per day.' },
    { id:5,  title:'DevOps Engineer',              company:'CloudBridge',             companyAbout:'CloudBridge is a Singapore-based technology firm providing DevOps-as-a-service to 200+ startups and enterprises in Asia-Pacific.',        state:'Singapore',              country:'Singapore',    salary:'SGD 7,500–10,000/mo',   visa:true,  sector:'IT',          type:'Full-time', tags:['Docker','Kubernetes','CI/CD','Jenkins'], roles:['Build pipelines','Infra monitoring','Automate deployments','Disaster recovery'],                   desc:'CloudBridge seeks a DevOps Engineer to manage and improve client cloud delivery pipelines across APAC.' },
    { id:6,  title:'Full Stack Developer',         company:'DigitalEdge',             companyAbout:'DigitalEdge is an Amsterdam-based digital agency with 300+ staff building eCommerce and SaaS products for European brands.',              state:'North Holland',          country:'Netherlands',  salary:'€60,000–€78,000',       visa:true,  sector:'IT',          type:'Full-time', tags:['React','Python','Django','AWS'],        roles:['Feature development','DB schema design','Client demos','Agile sprints'],                          desc:'DigitalEdge is growing its engineering team to serve fast-growing European eCommerce and SaaS brands.' },
    { id:7,  title:'Data Scientist',               company:'AnalytiQ',                companyAbout:'AnalytiQ is a Sydney-based AI and analytics firm helping retail and finance companies make data-driven decisions.',                        state:'New South Wales',        country:'Australia',    salary:'AUD 110,000–140,000',   visa:true,  sector:'IT',          type:'Full-time', tags:['Python','ML','TensorFlow','SQL'],       roles:['Build ML models','Data pipeline mgmt','Stakeholder reporting','Model deployment'],                 desc:'AnalytiQ is looking for a Data Scientist to develop predictive models for our retail and finance clients.' },
    { id:8,  title:'Cybersecurity Analyst',        company:'SecureNet',               companyAbout:'SecureNet is a Riyadh-based cybersecurity firm protecting critical government and banking infrastructure in Saudi Arabia.',                state:'Riyadh',                 country:'Saudi Arabia', salary:'SAR 18,000–25,000/mo',  visa:true,  sector:'IT',          type:'Full-time', tags:['SIEM','Penetration Testing','ISO 27001'], roles:['Threat monitoring','Vulnerability assessments','Incident response','Policy creation'],            desc:'SecureNet is hiring a Cybersecurity Analyst to defend critical national infrastructure and banking systems in the Kingdom.' },
    { id:9,  title:'Mobile App Developer',         company:'AppWave',                 companyAbout:'AppWave is a Berlin-based mobile studio with 50+ apps published on iOS and Android used by millions across Europe.',                      state:'Berlin',                 country:'Germany',      salary:'€65,000–€80,000',       visa:true,  sector:'IT',          type:'Full-time', tags:['Flutter','Dart','Firebase'],            roles:['App development','UI polish','App store releases','Bug fixing'],                                   desc:'AppWave builds stunning mobile apps for European clients and is looking for a Flutter developer to join their Berlin studio.' },
    { id:10, title:'QA Automation Engineer',       company:'TestPro',                 companyAbout:'TestPro is a Warsaw-based QA firm serving clients in banking, insurance, and eCommerce.',                                                state:'Masovian',               country:'Poland',       salary:'PLN 12,000–18,000/mo',  visa:true,  sector:'IT',          type:'Full-time', tags:['Selenium','Cypress','JIRA','Agile'],    roles:['Write test scripts','Regression testing','CI integration','Report defects'],                      desc:'TestPro is looking for a QA Automation Engineer to ensure software quality for financial and retail clients in Poland.' },
    { id:11, title:'Registered Nurse (ICU)',       company:'Royal Melbourne Hospital', companyAbout:'Royal Melbourne Hospital is one of Australia\'s largest public hospitals providing world-class care across 100+ specialties.',          state:'Victoria',               country:'Australia',    salary:'AUD 75,000–95,000',     visa:true,  sector:'Medical',     type:'Full-time', tags:['ICU','Critical Care','AHPRA'],          roles:['Patient monitoring','Medication administration','Family communication','Emergency response'],       desc:'Royal Melbourne Hospital seeks Indian-trained ICU nurses willing to relocate. AHPRA registration support provided.' },
    { id:12, title:'General Physician (MBBS)',     company:'NHS Trust',               companyAbout:'NHS is the UK\'s publicly funded healthcare system employing 1.5 million staff across England.',                                         state:'West Midlands',          country:'UK',           salary:'£50,000–£70,000',       visa:true,  sector:'Medical',     type:'Full-time', tags:['MBBS','GMC Registration','Primary Care'], roles:['Patient consultations','Prescriptions','Referrals','Health screenings'],                         desc:'NHS Trust is actively recruiting Indian-qualified doctors with GMC registration support for Birmingham-area GP clinics.' },
    { id:13, title:'Pharmacist',                   company:'PharmaCare Canada',       companyAbout:'PharmaCare is a Toronto-headquartered pharmacy chain with 200+ branches across Ontario offering relocation support.',                    state:'Ontario',                country:'Canada',       salary:'CAD 80,000–100,000',    visa:true,  sector:'Medical',     type:'Full-time', tags:['PharmD','Drug Dispensing','Patient Counselling'], roles:['Dispense medications','Patient counselling','Inventory mgmt','Prescription review'],           desc:'PharmaCare offers full relocation and visa sponsorship for Indian-qualified pharmacists to join their Ontario branches.' },
    { id:14, title:'Radiologist',                  company:'Mediplus Clinics',        companyAbout:'Mediplus is a private diagnostic and imaging group with 30 clinics across the UAE offering premium outpatient services.',                state:'Abu Dhabi',              country:'UAE',          salary:'AED 35,000–50,000/mo',  visa:true,  sector:'Medical',     type:'Full-time', tags:['MD Radiology','MRI','CT Scan'],         roles:['Interpret imaging','Write radiology reports','Supervise technicians','Quality audits'],            desc:'Mediplus is seeking experienced radiologists to join their rapidly expanding diagnostics network across Abu Dhabi.' },
    { id:15, title:'Staff Nurse',                  company:'Hamad Medical Corp',      companyAbout:'Hamad Medical Corporation is Qatar\'s principal public healthcare provider managing 12 hospitals with international clinical standards.', state:'Doha',                   country:'Qatar',        salary:'QAR 12,000–16,000/mo',  visa:true,  sector:'Medical',     type:'Full-time', tags:['BSc Nursing','Patient Care','BLS/ACLS'], roles:['Patient assessment','Wound care','Medication rounds','Documentation'],                           desc:'Hamad Medical Corp recruits Indian nurses directly from India with tax-free salary, accommodation, and flight allowance.' },
    { id:16, title:'Physiotherapist',              company:'RehabPlus',               companyAbout:'RehabPlus is a leading rehabilitation network in Germany with 80 clinics offering physiotherapy and sports rehab.',                       state:'Baden-Württemberg',      country:'Germany',      salary:'€42,000–€55,000',       visa:true,  sector:'Medical',     type:'Full-time', tags:['BPT','Musculoskeletal','Neurological Rehab'], roles:['Assessment','Treatment planning','Manual therapy','Patient education'],                        desc:'RehabPlus welcomes applications from Indian physiotherapists. German language B2 support provided.' },
    { id:17, title:'Civil Engineer',               company:'AlBawani Group',          companyAbout:'AlBawani is one of Saudi Arabia\'s largest construction conglomerates delivering mega infrastructure and hospitality projects.',          state:'Jeddah',                 country:'Saudi Arabia', salary:'SAR 12,000–18,000/mo',  visa:true,  sector:'Labour',      type:'Full-time', tags:['AutoCAD','Structural Design','Project Mgmt'], roles:['Site supervision','Drawing review','Safety compliance','Contractor coordination'],             desc:'AlBawani is hiring Indian civil engineers for NEOM and Vision 2030 mega projects in Jeddah and Riyadh.' },
    { id:18, title:'Electrician (Industrial)',     company:'PowerGrid Qatar',         companyAbout:'PowerGrid Qatar provides electrical contracting services to oil & gas facilities and commercial developments across Qatar.',             state:'Al Rayyan',              country:'Qatar',        salary:'QAR 3,500–6,000/mo',    visa:true,  sector:'Labour',      type:'Full-time', tags:['LV/HV Wiring','PLC','Safety Certified'], roles:['Panel wiring','Equipment maintenance','Safety inspections','Troubleshooting'],                  desc:'PowerGrid Qatar is hiring experienced industrial electricians from India with ITI or Diploma qualifications.' },
    { id:19, title:'Plumber',                      company:'Gulf MEP Services',       companyAbout:'Gulf MEP Services is a Dubai-based MEP contractor managing large-scale commercial and residential projects.',                            state:'Dubai',                  country:'UAE',          salary:'AED 2,500–4,500/mo',    visa:true,  sector:'Labour',      type:'Full-time', tags:['Plumbing','MEP','Pipe Fitting'],        roles:['Install plumbing systems','Leak detection','Maintenance','Blueprint reading'],                    desc:'Gulf MEP Services provides accommodation and visa for skilled Indian plumbers for Dubai high-rise construction projects.' },
    { id:20, title:'Welder (MIG/TIG)',             company:'Aramco Contractors',      companyAbout:'A subcontractor to Saudi Aramco operating oil & gas fabrication yards in Jubail Industrial City.',                                      state:'Eastern Province',       country:'Saudi Arabia', salary:'SAR 4,000–7,000/mo',    visa:true,  sector:'Labour',      type:'Full-time', tags:['MIG','TIG','ASME','Structural Welding'], roles:['Pipe welding','Quality inspection','NDT testing','Safety adherence'],                           desc:'Aramco subcontractor urgently needs certified Indian welders for Jubail refinery and petrochemical plant projects.' },
    { id:21, title:'Forklift Operator',            company:'LogiHub Germany',         companyAbout:'LogiHub is a Dusseldorf-based 3PL company managing warehousing and distribution for major retail brands.',                             state:'North Rhine-Westphalia', country:'Germany',      salary:'€28,000–€36,000',       visa:true,  sector:'Labour',      type:'Full-time', tags:['Forklift Licence','Warehouse Mgmt','ERP'], roles:['Load/unload goods','Inventory tracking','Safety compliance','Team collaboration'],             desc:'LogiHub is actively hiring Indian forklift operators for their large distribution centres in Dusseldorf.' },
    { id:22, title:'Carpenter',                    company:'Fitout Masters',          companyAbout:'Fitout Masters is a premium interior fit-out contractor based in Dubai delivering luxury residential and hospitality projects.',         state:'Dubai',                  country:'UAE',          salary:'AED 2,200–3,800/mo',    visa:true,  sector:'Labour',      type:'Full-time', tags:['Wood Joinery','Furniture Fit-out','AutoCAD'], roles:['Custom furniture fabrication','Site installation','Client liaison','Quality checks'],          desc:'Fitout Masters provides free visa, accommodation, and air ticket for skilled Indian carpenters joining their Dubai team.' },
    { id:23, title:'Relationship Manager – Banking', company:'Emirates NBD',          companyAbout:'Emirates NBD is one of the largest banking groups in the Middle East with 900+ branches and AED 700B+ in assets.',                      state:'Dubai',                  country:'UAE',          salary:'AED 12,000–18,000/mo',  visa:true,  sector:'Banking',     type:'Full-time', tags:['Banking','Retail Finance','CRM','KYC'],  roles:['Client acquisition','Portfolio management','Cross-selling','Compliance adherence'],              desc:'Emirates NBD seeks Indian banking professionals with NRI client management experience for its retail banking division.' },
    { id:24, title:'Financial Analyst',            company:'Deutsche Bank',           companyAbout:'Deutsche Bank is a global investment bank headquartered in Frankfurt with operations in 58 countries and 90,000+ employees.',           state:'Hesse',                  country:'Germany',      salary:'€65,000–€85,000',       visa:true,  sector:'Banking',     type:'Full-time', tags:['CFA','Bloomberg','Financial Modeling'],  roles:['Financial modelling','Risk analysis','Quarterly reporting','Board presentations'],                desc:'Deutsche Bank Frankfurt is recruiting experienced financial analysts with CFA or CA qualifications for its corporate finance division.' },
    { id:25, title:'AML Analyst',                  company:'HSBC',                    companyAbout:'HSBC is one of the world\'s largest banking and financial services organisations headquartered in London with 40M+ customers.',         state:'England',                country:'UK',           salary:'£45,000–£60,000',       visa:true,  sector:'Banking',     type:'Full-time', tags:['AML','KYC','Compliance','ACAMS'],       roles:['Transaction monitoring','SAR filing','Policy review','Regulatory training'],                     desc:'HSBC London is expanding its Financial Crime Compliance team and welcomes applications from Indian AML professionals.' },
    { id:26, title:'Credit Risk Analyst',          company:'ANZ Bank',                companyAbout:'ANZ is one of Australia\'s Big Four banks with 50,000+ staff and presence across 34 countries in Asia-Pacific.',                       state:'Victoria',               country:'Australia',    salary:'AUD 90,000–115,000',    visa:true,  sector:'Banking',     type:'Full-time', tags:['Credit Analysis','Risk Models','SQL','Python'], roles:['Credit scoring','Portfolio stress testing','Reporting','Stakeholder mgmt'],                 desc:'ANZ Melbourne is hiring Credit Risk Analysts to join its retail credit risk team.' },
    { id:27, title:'Investment Banking Analyst',   company:'QNB Capital',             companyAbout:'QNB is the largest bank in the Middle East and Africa by assets, headquartered in Doha with presence in 31 countries.',                state:'Doha',                   country:'Qatar',        salary:'QAR 18,000–28,000/mo',  visa:true,  sector:'Banking',     type:'Full-time', tags:['DCF','M&A','Financial Modeling','CFA'],  roles:['Deal analysis','Pitch decks','Valuation','Due diligence'],                                        desc:'QNB Capital is recruiting for its IB division to support major M&A and equity transactions across MENA markets.' },
    { id:28, title:'Customer Service Rep',         company:'Teleperformance',         companyAbout:'Teleperformance is the world\'s largest BPO company with 420,000 employees in 88 countries serving top global brands.',                state:'Lisbon',                 country:'Portugal',     salary:'€1,200–€1,600/mo',      visa:true,  sector:'BPO',         type:'Full-time', tags:['English C1','Customer Support','CRM'],  roles:['Handle customer queries','Email/chat support','Resolve complaints','Upselling'],                  desc:'Teleperformance Lisbon is hiring fluent English speakers from India for tech and telecom customer support campaigns.' },
    { id:29, title:'Technical Support Specialist', company:'Concentrix',              companyAbout:'Concentrix is a global CX solutions company with 300,000+ employees supporting Fortune 500 clients across 40+ countries.',              state:'Kuala Lumpur',           country:'Malaysia',     salary:'MYR 4,500–6,500/mo',    visa:true,  sector:'BPO',         type:'Full-time', tags:['Tech Support','ITIL','Troubleshooting'], roles:['L1/L2 tech support','Ticket resolution','Escalation handling','Knowledge base'],                 desc:'Concentrix KL is growing its India-facing tech support team and offers visa and relocation for qualified agents.' },
    { id:30, title:'BPO Team Leader',              company:'iQor',                    companyAbout:'iQor is a US-headquartered BPO firm with large operations in the Philippines and Malaysia serving global retail clients.',               state:'Cebu',                   country:'Philippines',  salary:'PHP 45,000–65,000/mo',  visa:true,  sector:'BPO',         type:'Full-time', tags:['Team Management','SLA','Coaching'],     roles:['Team performance monitoring','SLA adherence','Agent coaching','Reporting'],                       desc:'iQor Cebu is hiring experienced Indian BPO team leaders to manage English-medium customer service campaigns.' },
    { id:31, title:'Digital Marketing Manager',    company:'Publicis Groupe',         companyAbout:'Publicis Groupe is a global communications giant headquartered in Paris with operations in 100+ countries.',                           state:'Ile-de-France',          country:'France',       salary:'€50,000–€68,000',       visa:true,  sector:'Marketing',   type:'Full-time', tags:['SEO','Google Ads','Meta Ads','Analytics'], roles:['Campaign strategy','Budget management','Performance reporting','Team leadership'],             desc:'Publicis Paris is looking for a Digital Marketing Manager to lead pan-European digital campaigns for luxury and FMCG clients.' },
    { id:32, title:'Brand Manager',                company:'Unilever',                companyAbout:'Unilever is a British-Dutch consumer goods multinational with 400+ brands and operations in 190+ countries globally.',                  state:'South Holland',          country:'Netherlands',  salary:'€55,000–€72,000',       visa:true,  sector:'Marketing',   type:'Full-time', tags:['Brand Strategy','FMCG','Consumer Insights'], roles:['Brand strategy','NPD launches','ATL/BTL campaigns','Agency management'],                      desc:'Unilever Rotterdam is hiring a Brand Manager for its Foods and Refreshment division from its global talent pool.' },
    { id:33, title:'Content Strategist',           company:'HubSpot',                 companyAbout:'HubSpot is a Boston-based CRM and inbound marketing software company with offices in Dublin, Singapore, and Sydney.',                  state:'Leinster',               country:'Ireland',      salary:'€45,000–€60,000',       visa:true,  sector:'Marketing',   type:'Full-time', tags:['Content Marketing','SEO','Copywriting'], roles:['Content calendar mgmt','Blog and SEO writing','Social media strategy','Analytics'],               desc:'HubSpot Dublin is building its EMEA content team and welcomes applications from experienced Indian content strategists.' },
    { id:34, title:'Social Media Manager',         company:'WPP Group',               companyAbout:'WPP is the world\'s largest advertising company with agencies including Ogilvy and Grey operating in 112 countries.',                   state:'England',                country:'UK',           salary:'£38,000–£50,000',       visa:true,  sector:'Marketing',   type:'Full-time', tags:['Instagram','LinkedIn Ads','TikTok'],    roles:['Social calendar planning','Paid campaigns','Influencer coordination','Analytics'],                desc:'WPP London is hiring a Social Media Manager to handle multi-brand campaigns for its global FMCG and tech clients.' },
    { id:35, title:'Executive Assistant',          company:'McKinsey & Company',      companyAbout:'McKinsey is the world\'s top management consulting firm with 130+ offices globally advising Fortune 500 corporations.',                state:'Dubai',                  country:'UAE',          salary:'AED 9,000–13,000/mo',   visa:true,  sector:'Admin',       type:'Full-time', tags:['Calendar Mgmt','MS Office','Travel Coordination'], roles:['Executive scheduling','Travel booking','Meeting coordination','Document prep'],              desc:'McKinsey Dubai seeks a polished Executive Assistant to support senior partners across the Middle East practice.' },
    { id:36, title:'Office Administrator',         company:'Deloitte',                companyAbout:'Deloitte is a Big Four professional services firm with 330,000+ employees in 150+ countries offering audit, consulting, and tax services.', state:'Ontario',             country:'Canada',       salary:'CAD 50,000–65,000',     visa:true,  sector:'Admin',       type:'Full-time', tags:['Office Admin','SAP','Scheduling'],      roles:['Office coordination','Vendor mgmt','HR admin support','Event planning'],                          desc:'Deloitte Toronto is hiring an Office Administrator to support its growing consulting practice in the financial district.' },
    { id:37, title:'Personal Assistant',           company:'Al Habtoor Group',        companyAbout:'Al Habtoor Group is a Dubai-based conglomerate with businesses in hospitality, real estate, and automotive with $5B+ in assets.',       state:'Dubai',                  country:'UAE',          salary:'AED 8,000–12,000/mo',   visa:true,  sector:'Admin',       type:'Full-time', tags:['PA','Discretion','Outlook'],            roles:['Diary management','Correspondence','Household coordination','Errand management'],                  desc:'Al Habtoor Group requires an experienced Personal Assistant for a senior executive in Dubai. Accommodation provided.' },
    { id:38, title:'Hotel Front Office Manager',   company:'Marriott Hotels',         companyAbout:'Marriott International is the world\'s largest hotel chain with 8,000+ properties and 30+ brands in 139 countries.',                  state:'Dubai',                  country:'UAE',          salary:'AED 10,000–15,000/mo',  visa:true,  sector:'Hospitality', type:'Full-time', tags:['Hotel Ops','PMS','Guest Relations','OPERA'], roles:['Front desk mgmt','Check-in/out operations','Staff scheduling','VIP guest handling'],         desc:'Marriott Dubai is expanding its leadership team and welcomes Indian hospitality managers with international hotel experience.' },
    { id:39, title:'Chef de Partie',               company:'Hilton Hotels',           companyAbout:'Hilton is a global hospitality company with 7,000+ properties across 122 countries encompassing 18 hotel brands.',                     state:'London',                 country:'UK',           salary:'£28,000–£38,000',       visa:true,  sector:'Hospitality', type:'Full-time', tags:['Continental Cuisine','HACCP','Kitchen Mgmt'], roles:['Station management','Menu prep','Junior chef training','Food safety compliance'],            desc:'Hilton London is recruiting a skilled Chef de Partie for its flagship hotel kitchen serving 500+ covers per day.' },
    { id:40, title:'Restaurant Manager',           company:'Four Seasons',            companyAbout:'Four Seasons Hotels and Resorts is a Canadian luxury hospitality company operating 120+ properties in 47 countries.',                  state:'Riyadh',                 country:'Saudi Arabia', salary:'SAR 14,000–20,000/mo',  visa:true,  sector:'Hospitality', type:'Full-time', tags:['F&B Mgmt','P&L','Staff Training'],      roles:['Restaurant operations','Revenue management','Staff rostering','Guest feedback'],                  desc:'Four Seasons Riyadh is seeking an experienced Restaurant Manager to lead their flagship dining outlets.' },
    { id:41, title:'Mechanical Engineer',          company:'Siemens AG',              companyAbout:'Siemens is a global industrial manufacturing conglomerate headquartered in Munich with 300,000+ employees across energy and automation.',  state:'Bavaria',               country:'Germany',      salary:'€62,000–€82,000',       visa:true,  sector:'Engineering', type:'Full-time', tags:['CAD','SolidWorks','Manufacturing','Lean'], roles:['Product design','Tolerance analysis','Production support','Cross-team collab'],               desc:'Siemens Munich is looking for a Mechanical Engineer to design and optimise industrial automation components for its Energy division.' },
    { id:42, title:'Petroleum Engineer',           company:'Saudi Aramco',            companyAbout:'Saudi Aramco is the world\'s largest oil company by revenue with operations in 50+ countries.',                                        state:'Dhahran',                country:'Saudi Arabia', salary:'SAR 25,000–40,000/mo',  visa:true,  sector:'Engineering', type:'Full-time', tags:['Reservoir Eng','Drilling','Petrel'],    roles:['Reservoir analysis','Well performance','Drilling programme design','Reporting'],                  desc:'Saudi Aramco is recruiting Indian petroleum engineers for upstream operations in the Eastern Province. Tax-free salary.' },
    { id:43, title:'Structural Engineer',          company:'AECOM',                   companyAbout:'AECOM is a US-based infrastructure consulting firm with 50,000+ employees delivering transport, water, and building projects globally.',  state:'New South Wales',       country:'Australia',    salary:'AUD 95,000–125,000',    visa:true,  sector:'Engineering', type:'Full-time', tags:['Revit','STAAD Pro','Structural Design'], roles:['Structural analysis','Drawings review','Client liaison','Site visits'],                          desc:'AECOM Sydney is hiring Structural Engineers for high-rise residential and commercial building projects across NSW.' },
    { id:44, title:'Secondary School Teacher (Maths)', company:'Gems Education',      companyAbout:'GEMS Education is a global K-12 education group headquartered in Dubai operating 250+ schools in 14 countries.',                      state:'Dubai',                  country:'UAE',          salary:'AED 8,000–13,000/mo',   visa:true,  sector:'Education',   type:'Full-time', tags:['B.Ed','CBSE/ICSE','Classroom Mgmt'],    roles:['Lesson planning','Classroom teaching','Parent meetings','Exam preparation'],                      desc:'GEMS Education Dubai is hiring Indian math teachers for CBSE, British, and IB curriculum schools. Visa and accommodation provided.' },
    { id:45, title:'University Lecturer – CS',     company:'University of Toronto',   companyAbout:'University of Toronto is a globally top-ranked research university with 90,000+ students across three campuses in Ontario.',           state:'Ontario',                country:'Canada',       salary:'CAD 90,000–120,000',    visa:true,  sector:'Education',   type:'Full-time', tags:['PhD CS','Research','Python','ML'],      roles:['Undergraduate teaching','Research publication','Grant writing','Student supervision'],            desc:'UofT is recruiting a CS Lecturer for its AI and Machine Learning research group.' },
    { id:46, title:'HR Business Partner',          company:'Google',                  companyAbout:'Google LLC is one of the world\'s most valuable technology companies with 180,000+ employees across 50+ countries.',                   state:'Dublin',                 country:'Ireland',      salary:'€75,000–€95,000',       visa:true,  sector:'HR',          type:'Full-time', tags:['HRBP','Talent Mgmt','OKRs','Workday'],  roles:['Partner with leadership','Performance reviews','Org design','Change mgmt'],                      desc:'Google Dublin is hiring an HRBP to support its EMEA product and engineering teams through rapid growth.' },
    { id:47, title:'Talent Acquisition Specialist', company:'Amazon',                 companyAbout:'Amazon is the world\'s largest eCommerce and cloud computing company with 1.5M+ employees globally.',                                 state:'England',                country:'UK',           salary:'£45,000–£60,000',       visa:true,  sector:'HR',          type:'Full-time', tags:['Recruiting','ATS','LinkedIn Recruiter'], roles:['End-to-end recruiting','JD writing','Interview coordination','Offer negotiation'],                desc:'Amazon London is scaling its talent team and looking for experienced TA specialists with tech and ops hiring background.' },
    { id:48, title:'Supply Chain Manager',         company:'DHL Supply Chain',        companyAbout:'DHL is the world\'s largest logistics company operating in 220+ countries with 600,000+ employees.',                                  state:'North Rhine-Westphalia', country:'Germany',      salary:'€68,000–€88,000',       visa:true,  sector:'Logistics',   type:'Full-time', tags:['SAP','Inventory','S&OP','Procurement'], roles:['End-to-end supply chain','Vendor negotiations','Demand forecasting','KPI tracking'],              desc:'DHL Germany is recruiting a Supply Chain Manager to oversee warehousing and distribution for a major FMCG client.' },
    { id:49, title:'Freight Forwarding Officer',   company:'Agility Logistics',       companyAbout:'Agility is a Kuwait-headquartered global logistics company with 550+ offices in 100+ countries specialising in emerging markets.',     state:'Kuwait City',            country:'Kuwait',       salary:'KWD 800–1,200/mo',      visa:true,  sector:'Logistics',   type:'Full-time', tags:['Air Freight','Sea Freight','IATA'],     roles:['Shipment coordination','Customs documentation','Client billing','Carrier negotiation'],           desc:'Agility Kuwait is hiring an experienced Freight Forwarding Officer to manage air and sea cargo movements across GCC.' },
    { id:50, title:'Warehouse Supervisor',         company:'XPO Logistics',           companyAbout:'XPO is a top-10 global logistics company with 100,000 employees managing 800+ warehouse facilities across North America and Europe.',  state:'Ontario',                country:'Canada',       salary:'CAD 58,000–72,000',     visa:true,  sector:'Logistics',   type:'Full-time', tags:['WMS','Lean','Forklift Certified'],      roles:['Shift management','Staff scheduling','Inventory accuracy','Safety compliance'],                   desc:'XPO Logistics Toronto is hiring a Warehouse Supervisor to oversee a 200,000 sq ft distribution centre operation.' },

    /* ── 100 INDIA-BASED JOBS ── */
    /* IT – 20 roles */
    { id:51,  title:'Full Stack Developer',           company:'Infosys',                 companyAbout:'Infosys is one of India\'s largest IT services companies with 350,000+ employees delivering digital transformation for global clients.',   state:'Karnataka',              country:'India',        salary:'₹12–18 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['React','Node.js','MongoDB'],             roles:['Build full-stack features','Code reviews','API design','Agile sprints'],                          desc:'Infosys Bengaluru is hiring Full Stack Developers for its Digital Experience unit serving Fortune 500 clients.' },
    { id:52,  title:'Python Developer',               company:'TCS',                     companyAbout:'Tata Consultancy Services is India\'s largest IT company with 600,000+ employees operating in 150+ locations worldwide.',                  state:'Maharashtra',            country:'India',        salary:'₹10–16 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Python','Django','PostgreSQL'],          roles:['Backend development','Data pipeline','REST APIs','Unit testing'],                                  desc:'TCS Mumbai is scaling its Python engineering team for a major BFSI transformation programme.' },
    { id:53,  title:'Data Engineer',                  company:'Wipro',                   companyAbout:'Wipro is a global IT and consulting company headquartered in Bengaluru with 250,000+ employees serving clients in 66 countries.',          state:'Karnataka',              country:'India',        salary:'₹14–22 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Spark','Kafka','Databricks','SQL'],      roles:['Build ETL pipelines','Data quality checks','Performance tuning','Cloud migration'],                desc:'Wipro Bengaluru is hiring Data Engineers for its Analytics Centre of Excellence serving retail and telecom clients.' },
    { id:54,  title:'DevOps Engineer',                company:'HCL Technologies',        companyAbout:'HCL Technologies is a global technology company with 225,000 employees delivering IT services across 60 countries.',                      state:'Uttar Pradesh',          country:'India',        salary:'₹13–20 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Docker','Kubernetes','Terraform','AWS'], roles:['CI/CD pipelines','Infra automation','Monitoring','Incident management'],                          desc:'HCL Noida is seeking DevOps Engineers to manage cloud infrastructure for its global enterprise clients.' },
    { id:55,  title:'AI/ML Engineer',                 company:'Tech Mahindra',           companyAbout:'Tech Mahindra is a leading tech provider in AI, cloud, and connectivity with 150,000+ employees in 90+ countries.',                       state:'Telangana',              country:'India',        salary:'₹18–30 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['PyTorch','TensorFlow','NLP','MLOps'],   roles:['Model training','Feature engineering','Deploy ML services','Research papers'],                    desc:'Tech Mahindra Hyderabad is building an AI Centre of Excellence and needs ML Engineers for NLP and computer vision projects.' },
    { id:56,  title:'Cloud Solutions Architect',      company:'Cognizant',               companyAbout:'Cognizant is a Fortune 200 company with 350,000+ employees providing digital, technology, and operations services globally.',              state:'Tamil Nadu',             country:'India',        salary:'₹25–40 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['AWS','Azure','GCP','Solution Design'],  roles:['Cloud architecture design','Client workshops','Cost optimisation','Security governance'],          desc:'Cognizant Chennai is hiring Cloud Architects to lead migration and modernization projects for its BFSI and healthcare clients.' },
    { id:57,  title:'Cybersecurity Analyst',          company:'Mphasis',                 companyAbout:'Mphasis is a Bengaluru-based IT company specializing in cloud and cognitive services for banking and insurance clients.',                  state:'Karnataka',              country:'India',        salary:'₹12–20 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['SOC','SIEM','Threat Intelligence','VAPT'], roles:['Security monitoring','Incident response','Vulnerability scans','Compliance reporting'],          desc:'Mphasis Bengaluru is expanding its Cyber Defence Centre and hiring Security Analysts for 24×7 SOC operations.' },
    { id:58,  title:'SAP FICO Consultant',            company:'Capgemini',               companyAbout:'Capgemini India is a digital transformation leader with 175,000+ employees serving large enterprise clients across verticals.',            state:'Maharashtra',            country:'India',        salary:'₹15–28 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['SAP FICO','S/4HANA','FI Module','CO Module'], roles:['Requirement gathering','Configuration','Testing','Go-live support'],                         desc:'Capgemini Pune is looking for SAP FICO Consultants with S/4HANA implementation experience for manufacturing clients.' },
    { id:59,  title:'iOS Developer',                  company:'Persistent Systems',      companyAbout:'Persistent Systems is a Pune-based software and IT services firm with 22,000+ employees focused on product engineering and digital.',    state:'Maharashtra',            country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Swift','Xcode','UIKit','CoreData'],     roles:['App development','UI implementation','App store releases','Code reviews'],                         desc:'Persistent Systems Pune is hiring iOS Developers for its Digital Studio serving US and EU product companies.' },
    { id:60,  title:'QA Automation Engineer',         company:'Mindtree',                companyAbout:'Mindtree is a global technology services company, now part of the L&T Technology group, with 35,000+ employees.',                         state:'Karnataka',              country:'India',        salary:'₹9–16 LPA',             visa:false, sector:'IT',          type:'Full-time', tags:['Selenium','TestNG','Cypress','JIRA'],   roles:['Automation framework design','Test scripting','Regression testing','Defect reporting'],            desc:'Mindtree Bengaluru needs QA Automation Engineers for a large banking digital transformation project.' },
    { id:61,  title:'React Native Developer',         company:'Zoho Corporation',        companyAbout:'Zoho is a global SaaS company with 100+ business applications and 12,000+ employees headquartered in Chennai.',                          state:'Tamil Nadu',             country:'India',        salary:'₹10–20 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['React Native','JavaScript','Redux','REST'], roles:['Cross-platform app development','Performance optimisation','Feature delivery','API integration'], desc:'Zoho Chennai is hiring React Native Developers to build and improve its business suite mobile applications.' },
    { id:62,  title:'Business Analyst – IT',          company:'Accenture',               companyAbout:'Accenture is a global professional services firm with 700,000+ employees helping clients build digital core capabilities.',                state:'Karnataka',              country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['JIRA','Agile','BRD','Stakeholder Mgmt'], roles:['Requirements gathering','Process mapping','UAT coordination','Sprint planning'],                  desc:'Accenture Bengaluru is hiring IT BAs for a large enterprise digital transformation programme in the retail sector.' },
    { id:63,  title:'Blockchain Developer',           company:'IBM India',               companyAbout:'IBM India is headquartered in Bengaluru with 150,000+ employees working on consulting, cloud, and AI-powered solutions.',                 state:'Karnataka',              country:'India',        salary:'₹20–35 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Hyperledger','Solidity','Smart Contracts','Web3'], roles:['Smart contract development','DeFi integrations','Security audits','Client demos'],           desc:'IBM India Bengaluru is building a Blockchain Centre of Competency and hiring experienced Solidity developers.' },
    { id:64,  title:'UI/UX Designer',                 company:'Freshworks',              companyAbout:'Freshworks is a Chennai-based global SaaS company with products used by 60,000+ businesses and 5,000+ employees.',                       state:'Tamil Nadu',             country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Figma','Design Systems','Usability Testing','Prototyping'], roles:['User research','Wireframing','Visual design','Design system maintenance'],                desc:'Freshworks Chennai is looking for UX Designers to craft elegant experiences across its CRM and customer support products.' },
    { id:65,  title:'Network Engineer',               company:'NTT Data',                companyAbout:'NTT Data India is an IT services arm of NTT Group with 35,000+ employees delivering infrastructure and managed services.',                state:'Telangana',              country:'India',        salary:'₹8–14 LPA',             visa:false, sector:'IT',          type:'Full-time', tags:['CCNA','Routing','Switching','MPLS'],    roles:['Network configuration','L2/L3 troubleshooting','Incident management','Documentation'],            desc:'NTT Data Hyderabad is hiring Network Engineers for its Global Managed Services team supporting enterprise clients.' },
    { id:66,  title:'Salesforce Developer',           company:'Hexaware Technologies',   companyAbout:'Hexaware is a Mumbai-based global IT and BPO company with 30,000+ employees across 19 countries.',                                      state:'Maharashtra',            country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Apex','LWC','SOQL','Salesforce CRM'],  roles:['Custom app development','Workflow automation','CRM integration','Client support'],                desc:'Hexaware Mumbai is seeking Salesforce Developers with Lightning Web Component experience for US-based insurance clients.' },
    { id:67,  title:'Product Manager – SaaS',         company:'Razorpay',                companyAbout:'Razorpay is India\'s leading full-stack payments company processing $90B+ annually, headquartered in Bengaluru.',                        state:'Karnataka',              country:'India',        salary:'₹25–45 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Product Strategy','Roadmapping','SQL','Growth'], roles:['Define product vision','Drive roadmap','Work with engineering','Analyse metrics'],              desc:'Razorpay Bengaluru is hiring Product Managers to drive the next phase of growth for its payments and banking products.' },
    { id:68,  title:'Embedded Systems Engineer',      company:'L&T Technology Services', companyAbout:'L&T Technology Services is an engineering R&D services company with 23,000+ engineers serving global automotive and semiconductor clients.', state:'Gujarat',             country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['C','RTOS','CAN Bus','ARM Cortex'],     roles:['Firmware development','Hardware bring-up','Testing','Documentation'],                             desc:'LTTS Vadodara is hiring Embedded Engineers for automotive ECU development projects for European OEM clients.' },
    { id:69,  title:'Data Analyst',                   company:'Flipkart',                companyAbout:'Flipkart is India\'s largest e-commerce marketplace with 350 million+ registered users and 48 fulfillment centers.',                      state:'Karnataka',              country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Python','SQL','Tableau','Statistics'],  roles:['Data querying','Dashboard building','A/B testing','Business insights'],                           desc:'Flipkart Bengaluru is hiring Data Analysts to power decision-making across its supply chain and growth teams.' },
    { id:70,  title:'Java Backend Developer',         company:'Paytm',                   companyAbout:'Paytm is India\'s leading digital payments and financial services company with 100M+ users and a large engineering team in Noida.',        state:'Uttar Pradesh',          country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'IT',          type:'Full-time', tags:['Java','Spring Boot','Microservices','Redis'], roles:['API development','Service design','Performance tuning','Code review'],                        desc:'Paytm Noida is expanding its core payments engineering team and hiring senior Java developers for its financial platform.' },

    /* Medical – 15 roles */
    { id:71,  title:'General Physician',              company:'Apollo Hospitals',        companyAbout:'Apollo Hospitals is India\'s largest integrated healthcare group with 72+ hospitals and 10,000+ beds across 21 states.',                  state:'Tamil Nadu',             country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MBBS','Clinical Practice','Patient Care'], roles:['OPD consultations','Diagnosis','Treatment plans','Referrals'],                                 desc:'Apollo Hospitals Chennai is hiring General Physicians for its busy outpatient departments across Tamil Nadu.' },
    { id:72,  title:'ICU Nurse',                      company:'Fortis Healthcare',       companyAbout:'Fortis Healthcare operates 36+ hospitals in India with a network of over 4,000 operational beds.',                                       state:'Haryana',                country:'India',        salary:'₹5–9 LPA',              visa:false, sector:'Medical',     type:'Full-time', tags:['Critical Care','Ventilator Mgmt','BLS'],roles:['Patient monitoring','Ventilator care','Medication rounds','Emergency response'],                  desc:'Fortis Gurugram is urgently hiring ICU Nurses with at least 2 years of critical care experience.' },
    { id:73,  title:'Radiologist',                    company:'Narayana Health',         companyAbout:'Narayana Health is one of India\'s largest multi-specialty hospital chains with 24+ hospitals and a focus on affordable quality care.',   state:'Karnataka',              country:'India',        salary:'₹18–35 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MRI','CT Scan','DNB Radiology','PACS'],roles:['Image interpretation','Radiology reports','Quality audits','Resident training'],                 desc:'Narayana Health Bengaluru is hiring Radiologists for its imaging centres across Karnataka and Andhra Pradesh.' },
    { id:74,  title:'Pharmacist',                     company:'MedPlus Health Services', companyAbout:'MedPlus is one of India\'s largest pharmacy retail chains with 4,000+ stores across 11 states.',                                         state:'Telangana',              country:'India',        salary:'₹4–7 LPA',              visa:false, sector:'Medical',     type:'Full-time', tags:['PharmD','Drug Dispensing','Inventory'],  roles:['Dispense medications','Patient counselling','Stock management','Prescription verification'],       desc:'MedPlus Hyderabad is hiring licensed pharmacists for its pharmacy stores across Telangana and Andhra Pradesh.' },
    { id:75,  title:'Physiotherapist',                company:'Manipal Hospitals',       companyAbout:'Manipal Hospitals is a top hospital chain with 28+ facilities and 8,000+ beds across India.',                                            state:'Karnataka',              country:'India',        salary:'₹5–9 LPA',              visa:false, sector:'Medical',     type:'Full-time', tags:['BPT','Orthopedic Rehab','Neurological Rehab'], roles:['Assessment','Treatment plan','Manual therapy','Exercise prescription'],                     desc:'Manipal Hospitals Bengaluru is hiring Physiotherapists for its orthopaedics and neurology departments.' },
    { id:76,  title:'Cardiologist',                   company:'Max Healthcare',          companyAbout:'Max Healthcare operates 17 hospitals across North India with 3,000+ beds and 1,500+ senior consultants.',                                 state:'Delhi',                  country:'India',        salary:'₹40–80 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MD Cardiology','Echo','Cath Lab','CCU'], roles:['OPD & IPD consultations','Cath lab procedures','Team leadership','Research'],                   desc:'Max Healthcare Delhi is recruiting experienced Cardiologists for its cardiac science department at Saket and Patparganj.' },
    { id:77,  title:'Lab Technician (Pathology)',     company:'Thyrocare',               companyAbout:'Thyrocare is India\'s first fully automated diagnostic laboratory with a network of 800+ labs and collection centres.',                   state:'Maharashtra',            country:'India',        salary:'₹3.5–6 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['DMLT','Haematology','Biochemistry','LIS'], roles:['Sample processing','Test analysis','Report generation','Quality control'],                    desc:'Thyrocare Navi Mumbai is hiring Lab Technicians for its high-throughput pathology processing centre.' },
    { id:78,  title:'Dentist (BDS)',                  company:'Clove Dental',            companyAbout:'Clove Dental is India\'s largest chain of dental clinics with 700+ clinics across 20+ cities.',                                           state:'Maharashtra',            country:'India',        salary:'₹6–12 LPA',             visa:false, sector:'Medical',     type:'Full-time', tags:['BDS','Root Canal','Orthodontics','Implants'], roles:['Patient consultations','Dental procedures','X-ray interpretation','Patient education'],       desc:'Clove Dental Mumbai is hiring BDS-qualified dentists for its rapidly expanding clinic network across Maharashtra.' },
    { id:79,  title:'Oncologist',                     company:'AIIMS New Delhi',         companyAbout:'AIIMS is India\'s premier public medical institution and hospital offering tertiary care across all specialties.',                         state:'Delhi',                  country:'India',        salary:'₹20–45 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MD Oncology','Chemotherapy','Palliative Care','Research'], roles:['Patient management','Chemo protocols','Research publications','Resident teaching'],       desc:'AIIMS New Delhi is recruiting Oncologists for its cancer centre to strengthen its clinical and research programmes.' },
    { id:80,  title:'Nursing Supervisor',             company:'Medanta Hospital',        companyAbout:'Medanta – The Medicity is a 1,250-bed super-specialty hospital in Gurugram providing care across 45+ specialties.',                      state:'Haryana',                country:'India',        salary:'₹7–12 LPA',             visa:false, sector:'Medical',     type:'Full-time', tags:['Nursing Administration','Team Management','Quality Standards'], roles:['Supervise nursing staff','Roster management','SOP adherence','Patient safety audits'],   desc:'Medanta Gurugram is hiring Nursing Supervisors for its ward management and clinical quality division.' },
    { id:81,  title:'Emergency Medicine Physician',   company:'Aster DM Healthcare',     companyAbout:'Aster DM Healthcare is a leading multi-specialty healthcare provider operating in India and the GCC with 25+ hospitals.',                state:'Kerala',                 country:'India',        salary:'₹18–32 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MBBS','MD Emergency','ATLS','ACLS'],    roles:['Emergency patient management','Triage','Resuscitation','ICU liaison'],                            desc:'Aster DM Healthcare Kochi is hiring Emergency Medicine Physicians for its trauma and emergency division.' },
    { id:82,  title:'Psychiatrist',                   company:'Nimhans',                 companyAbout:'NIMHANS is India\'s premier Institute of Mental Health and Neurosciences in Bengaluru, a deemed university of national importance.',     state:'Karnataka',              country:'India',        salary:'₹20–40 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MD Psychiatry','CBT','Psychopharmacology','Research'], roles:['Patient evaluation','Therapy management','Research','Resident supervision'],               desc:'NIMHANS Bengaluru is seeking Psychiatrists for clinical practice and academic research positions.' },
    { id:83,  title:'Ophthalmologist',                company:'Sankara Nethralaya',      companyAbout:'Sankara Nethralaya is one of India\'s top eye care hospitals with centres across Tamil Nadu and Andhra Pradesh.',                        state:'Tamil Nadu',             country:'India',        salary:'₹18–35 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MS Ophthalmology','Phaco','Retina','Glaucoma'], roles:['OPD consultations','Surgical procedures','Teaching','Research'],                           desc:'Sankara Nethralaya Chennai is hiring Ophthalmologists for its sub-specialty departments including retina and cornea.' },
    { id:84,  title:'Hospital Administrator',         company:'Columbia Asia',           companyAbout:'Columbia Asia is a leading hospital chain with multi-specialty facilities across Karnataka, Maharashtra, and West Bengal.',               state:'Karnataka',              country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'Medical',     type:'Full-time', tags:['MHA','Healthcare Operations','JCI Accreditation'], roles:['Hospital operations','Regulatory compliance','Budgeting','Staff management'],                desc:'Columbia Asia Bengaluru is hiring a Hospital Administrator to manage daily operations across two facilities.' },
    { id:85,  title:'Occupational Therapist',         company:'Sir Ganga Ram Hospital',  companyAbout:'Sir Ganga Ram Hospital is a 675-bed multi-specialty hospital in New Delhi known for excellence in surgery and rehabilitation.',          state:'Delhi',                  country:'India',        salary:'₹5–9 LPA',              visa:false, sector:'Medical',     type:'Full-time', tags:['BOT','Pediatric OT','Neurological Rehab'], roles:['Patient assessment','Adaptive equipment','Therapy sessions','Caregiver training'],            desc:'Sir Ganga Ram Hospital New Delhi is hiring Occupational Therapists for its rehabilitation department.' },

    /* Chemical – 10 roles */
    { id:86,  title:'Process Engineer (Chemical)',    company:'Reliance Industries',     companyAbout:'Reliance Industries is India\'s largest private-sector company operating the world\'s largest oil-to-chemicals complex in Jamnagar.',   state:'Gujarat',                country:'India',        salary:'₹10–20 LPA',            visa:false, sector:'Chemical',    type:'Full-time', tags:['ChE','Process Design','Aspen Plus','Safety'], roles:['Process simulation','Debottlenecking','Safety reviews','SOP writing'],                      desc:'Reliance Industries Jamnagar is hiring Process Engineers for its Petrochemicals and Refining complex.' },
    { id:87,  title:'Quality Control Chemist',        company:'Dr. Reddy\'s Laboratories', companyAbout:'Dr. Reddy\'s is a leading global pharmaceutical company headquartered in Hyderabad with operations in 66 countries.',              state:'Telangana',              country:'India',        salary:'₹5–10 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['HPLC','GC','QC','USP/BP Pharmacopoeia'], roles:['Sample analysis','Method validation','Batch release','Stability studies'],                    desc:'Dr. Reddy\'s Hyderabad is hiring QC Chemists for its API and finished dosage manufacturing facilities.' },
    { id:88,  title:'R&D Scientist – Formulation',   company:'Sun Pharmaceuticals',     companyAbout:'Sun Pharma is the world\'s fourth-largest specialty generic pharma company headquartered in Mumbai.',                                   state:'Maharashtra',            country:'India',        salary:'₹8–15 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['Formulation Dev','Stability','GMP','ICH Guidelines'], roles:['New formulation development','Stability testing','Tech transfer','Regulatory dossier'], desc:'Sun Pharma Mumbai R&D centre is hiring Formulation Scientists for its oral solid dosage development team.' },
    { id:89,  title:'Chemical Engineer – Fertilizers', company:'Chambal Fertilisers',   companyAbout:'Chambal Fertilisers is one of India\'s largest fertilizer manufacturers with plants in Rajasthan and Gadepan.',                        state:'Rajasthan',              country:'India',        salary:'₹7–14 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['Ammonia','Urea','DCS','Process Safety'],roles:['Plant operations','Process optimisation','Safety management','Shift supervision'],                desc:'Chambal Fertilisers Kota is hiring Chemical Engineers for its urea and ammonia production plants.' },
    { id:90,  title:'EHS Officer',                    company:'BASF India',              companyAbout:'BASF India is a subsidiary of the world\'s largest chemical company, with manufacturing and R&D sites across Maharashtra and Gujarat.',   state:'Maharashtra',            country:'India',        salary:'₹8–14 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['EHS','HAZOP','ISO 14001','OHSAS 18001'], roles:['Safety audits','Incident investigation','Training','Regulatory compliance'],                  desc:'BASF India Thane is seeking an EHS Officer to manage health, safety, and environment compliance across its manufacturing plant.' },
    { id:91,  title:'Production Chemist',             company:'Aarti Industries',        companyAbout:'Aarti Industries is a leading Indian specialty chemical and pharmaceutical company manufacturing 200+ products in Gujarat.',            state:'Gujarat',                country:'India',        salary:'₹5–10 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['Organic Chemistry','Batch Records','GMP','MSDS'], roles:['Batch manufacturing','Quality checks','Documentation','Equipment maintenance'],             desc:'Aarti Industries Vapi is hiring Production Chemists for its speciality chemicals manufacturing division.' },
    { id:92,  title:'Instrumentation Engineer',       company:'Pidilite Industries',     companyAbout:'Pidilite Industries is the market leader in adhesives and construction chemicals in India with brands like Fevicol and Dr. Fixit.',     state:'Maharashtra',            country:'India',        salary:'₹6–12 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['DCS','PLC','Calibration','SCADA'],      roles:['Instrument maintenance','Calibration','Control system upkeep','Troubleshooting'],                desc:'Pidilite Industries Mumbai is hiring Instrumentation Engineers for its chemical manufacturing sites in Maharashtra.' },
    { id:93,  title:'Regulatory Affairs Executive',   company:'Cipla',                   companyAbout:'Cipla is a global pharmaceutical company headquartered in Mumbai with manufacturing in 16 countries and products in 80+ markets.',       state:'Maharashtra',            country:'India',        salary:'₹8–16 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['CTD','USFDA','CDSCO','Dossier Preparation'], roles:['Regulatory submissions','Label reviews','Agency queries','Change control'],                 desc:'Cipla Mumbai is hiring Regulatory Affairs Executives to manage domestic and international drug submission activities.' },
    { id:94,  title:'Polymer Technologist',           company:'Sintex Industries',       companyAbout:'Sintex Industries is a leading plastic-moulded and building materials company headquartered in Kalol, Gujarat.',                       state:'Gujarat',                country:'India',        salary:'₹6–12 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['Polymer Science','Extrusion','Injection Moulding','QC'], roles:['Material testing','Process control','Product qualification','Troubleshooting'],           desc:'Sintex Industries Kalol is hiring Polymer Technologists for its plastics manufacturing and R&D division.' },
    { id:95,  title:'Chemical Plant Operator',        company:'HPCL',                    companyAbout:'Hindustan Petroleum Corporation Limited is a Maharatna company with refineries in Mumbai and Visakhapatnam producing 17+ MMTPA.',       state:'Maharashtra',            country:'India',        salary:'₹7–13 LPA',             visa:false, sector:'Chemical',    type:'Full-time', tags:['Refinery Ops','DCS','HAZOP','PTW'],     roles:['Unit operation','Process monitoring','Safety compliance','Shift handover'],                       desc:'HPCL Mumbai Refinery is hiring trained Chemical Plant Operators for its crude distillation and processing units.' },

    /* Aerospace – 10 roles */
    { id:96,  title:'Aerospace Engineer',             company:'HAL',                     companyAbout:'Hindustan Aeronautics Limited is India\'s premier aerospace and defence manufacturer producing aircraft, helicopters, and engines.',     state:'Karnataka',              country:'India',        salary:'₹9–18 LPA',             visa:false, sector:'Aerospace',   type:'Full-time', tags:['CATIA','FEA','Aerodynamics','MIL-STD'],roles:['Structural design','Fatigue analysis','Drawing release','Test support'],                          desc:'HAL Bengaluru is hiring Aerospace Engineers for its rotary wing and fighter aircraft production and design divisions.' },
    { id:97,  title:'Aircraft Maintenance Engineer',  company:'Air India',               companyAbout:'Air India is India\'s flag carrier airline operating 100+ aircraft on domestic and international routes from its Delhi hub.',            state:'Delhi',                  country:'India',        salary:'₹8–16 LPA',             visa:false, sector:'Aerospace',   type:'Full-time', tags:['DGCA AME','B1/B2 Licence','Line Maintenance','Avionics'], roles:['Aircraft servicing','Defect rectification','Pre-flight checks','DGCA compliance'], desc:'Air India Delhi is hiring DGCA-licensed AMEs for line maintenance operations on its Boeing and Airbus fleet.' },
    { id:98,  title:'Avionics Engineer',              company:'BEL',                     companyAbout:'Bharat Electronics Limited is a Navratna defence PSU designing and manufacturing advanced electronics and avionics systems.',           state:'Karnataka',              country:'India',        salary:'₹10–20 LPA',            visa:false, sector:'Aerospace',   type:'Full-time', tags:['Avionics','Radar','Embedded C','DO-178C'],roles:['Avionics design','Software verification','Ground testing','Documentation'],                   desc:'BEL Bengaluru is hiring Avionics Engineers for its radar and communication systems division under Defence programmes.' },
    { id:99,  title:'Flight Operations Officer',      company:'IndiGo',                  companyAbout:'IndiGo is India\'s largest airline with 300+ aircraft and 500+ daily flights connecting 100+ destinations domestically and internationally.', state:'Haryana',            country:'India',        salary:'₹8–14 LPA',             visa:false, sector:'Aerospace',   type:'Full-time', tags:['ATPL','Flight Dispatch','Meteorology','ATC'], roles:['Flight planning','Fuel optimisation','NOTAM briefing','Crew coordination'],                desc:'IndiGo Gurugram is hiring Flight Operations Officers for its network operations centre managing daily flight dispatch.' },
    { id:100, title:'Structural Analysis Engineer',   company:'ISRO',                    companyAbout:'ISRO is India\'s national space agency responsible for space exploration, satellite development, and launch vehicle programmes.',       state:'Karnataka',              country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'Aerospace',   type:'Full-time', tags:['FEA','ANSYS','Nastran','Composites'],   roles:['Structural FEA','Test correlation','Design optimisation','Launch vehicle analysis'],              desc:'ISRO Bengaluru is hiring Structural Analysis Engineers for its launch vehicle and spacecraft structures division.' },
    { id:101, title:'UAV/Drone Engineer',             company:'ideaForge',               companyAbout:'ideaForge is India\'s leading drone manufacturer providing UAV systems to defence, industrial, and mapping clients.',                     state:'Maharashtra',            country:'India',        salary:'₹10–20 LPA',            visa:false, sector:'Aerospace',   type:'Full-time', tags:['Drone Design','Flight Control','ROS','Embedded Systems'], roles:['Drone hardware design','Autopilot tuning','Field testing','Certification'],            desc:'ideaForge Mumbai is hiring UAV Engineers to design and certify next-generation drone platforms for defence applications.' },
    { id:102, title:'Propulsion Engineer',            company:'DRDO',                    companyAbout:'DRDO is India\'s defence R&D organisation with 50+ laboratories developing missile, aircraft, and naval systems.',                      state:'Telangana',              country:'India',        salary:'₹10–20 LPA',            visa:false, sector:'Aerospace',   type:'Full-time', tags:['Propulsion','CFD','Solid Propellant','Combustion'], roles:['Propulsion design','Performance testing','Simulation','Technical reports'],              desc:'DRDO Hyderabad is hiring Propulsion Engineers for its missile and rocket propulsion research laboratories.' },
    { id:103, title:'MRO Planning Engineer',          company:'SpiceJet',                companyAbout:'SpiceJet is an Indian low-cost airline with 90+ aircraft operating domestic and international routes.',                                  state:'Telangana',              country:'India',        salary:'₹7–14 LPA',             visa:false, sector:'Aerospace',   type:'Full-time', tags:['MRO','MPD','Airworthiness','CAMO'],     roles:['Maintenance planning','Task card creation','Airworthiness management','DGCA liaison'],            desc:'SpiceJet Hyderabad is hiring MRO Planning Engineers for its Continuing Airworthiness Management Organisation.' },
    { id:104, title:'Aerospace Manufacturing Engineer', company:'Safran India',          companyAbout:'Safran India is a subsidiary of Safran Group, manufacturing aircraft engine components and landing systems in Bengaluru and Hyderabad.', state:'Karnataka',              country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'Aerospace',   type:'Full-time', tags:['CNC','Aerospace Manufacturing','AS9100','GD&T'], roles:['Process planning','CNC programming','Quality inspection','Lean implementation'],           desc:'Safran India Bengaluru is hiring Manufacturing Engineers for its engine component machining and assembly facility.' },
    { id:105, title:'Ground Support Equipment Tech',  company:'IndiGo',                  companyAbout:'IndiGo is India\'s largest airline with 300+ aircraft and 500+ daily flights connecting 100+ destinations domestically and internationally.', state:'Tamil Nadu',         country:'India',        salary:'₹5–9 LPA',              visa:false, sector:'Aerospace',   type:'Full-time', tags:['GSE','Hydraulics','Electrical','Maintenance'], roles:['GSE maintenance','Fault diagnosis','Preventive maintenance','Safety checks'],              desc:'IndiGo Chennai is hiring Ground Support Equipment Technicians for its airport operations support team.' },

    /* Finance – 15 roles */
    { id:106, title:'CA – Statutory Audit',           company:'Deloitte India',          companyAbout:'Deloitte India is one of the Big Four firms with 70,000+ professionals offering audit, tax, advisory, and consulting services.',         state:'Maharashtra',            country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['CA','Ind AS','CARO','Audit'],           roles:['Statutory audit','Risk assessment','Financial statements review','Regulatory compliance'],        desc:'Deloitte India Mumbai is hiring qualified CAs for its Audit and Assurance division serving listed companies.' },
    { id:107, title:'Investment Analyst',              company:'HDFC AMC',                companyAbout:'HDFC Asset Management Company is one of India\'s largest AMCs managing ₹7 lakh crore+ in AUM across equity and debt funds.',             state:'Maharashtra',            country:'India',        salary:'₹15–28 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['CFA','Equity Research','DCF','Bloomberg'], roles:['Stock analysis','Model building','Portfolio recommendations','Fund performance tracking'], desc:'HDFC AMC Mumbai is hiring Investment Analysts for its equity research team across sectors like BFSI and technology.' },
    { id:108, title:'Risk Manager',                   company:'ICICI Bank',              companyAbout:'ICICI Bank is India\'s second-largest private bank with 6,000+ branches and presence across 15 countries.',                              state:'Maharashtra',            country:'India',        salary:'₹18–32 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['Credit Risk','Market Risk','Basel III','VaR'], roles:['Risk modelling','Portfolio stress testing','Regulatory reporting','Governance'],            desc:'ICICI Bank Mumbai is hiring Risk Managers for its enterprise risk management function covering credit, market, and operational risk.' },
    { id:109, title:'Equity Research Analyst',        company:'Motilal Oswal',           companyAbout:'Motilal Oswal is one of India\'s top brokerage and wealth management firms with 9,000+ employees and a strong institutional research team.', state:'Maharashtra',          country:'India',        salary:'₹12–25 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['Equity Research','CFA','Sector Analysis','Modelling'], roles:['Coverage initiation','Earnings models','Investor reports','Management meetings'],       desc:'Motilal Oswal Mumbai is hiring Equity Research Analysts to cover technology, FMCG, and financial services sectors.' },
    { id:110, title:'Chartered Accountant – Tax',     company:'PwC India',               companyAbout:'PricewaterhouseCoopers India is a Big Four professional services firm with 50,000+ professionals across 19 cities in India.',            state:'Karnataka',              country:'India',        salary:'₹15–28 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['CA','Corporate Tax','Transfer Pricing','GST'], roles:['Tax advisory','Transfer pricing studies','GST compliance','Litigation support'],            desc:'PwC India Bengaluru is hiring CAs for its corporate and international tax practice serving MNC clients.' },
    { id:111, title:'Treasury Manager',               company:'Tata Motors',             companyAbout:'Tata Motors is India\'s largest automotive manufacturer with operations in 125+ countries and brands including Jaguar Land Rover.',        state:'Maharashtra',            country:'India',        salary:'₹18–32 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['Treasury','FX Risk','Derivatives','Bloomberg'], roles:['Cash management','FX hedging','Bank relations','Liquidity planning'],                       desc:'Tata Motors Mumbai is hiring a Treasury Manager to manage group forex exposure and liquidity across its global entities.' },
    { id:112, title:'Financial Controller',           company:'Mahindra Group',          companyAbout:'Mahindra Group is a USD 21B Indian multinational with businesses in automotive, aerospace, IT, and financial services.',                  state:'Maharashtra',            country:'India',        salary:'₹25–45 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['CA','Ind AS','Financial Reporting','Internal Controls'], roles:['Monthly close','Financial statements','Audit coordination','Management reporting'],    desc:'Mahindra Group Mumbai is hiring a Financial Controller for one of its high-growth subsidiary businesses.' },
    { id:113, title:'Credit Analyst',                 company:'Kotak Mahindra Bank',     companyAbout:'Kotak Mahindra Bank is one of India\'s leading private banks with 1,700+ branches and a diversified financial services portfolio.',      state:'Maharashtra',            country:'India',        salary:'₹8–15 LPA',             visa:false, sector:'Finance',     type:'Full-time', tags:['Credit Appraisal','Financial Modelling','CMA','SME Lending'], roles:['Credit assessment','Due diligence','Loan proposals','Portfolio monitoring'],           desc:'Kotak Mahindra Bank Mumbai is hiring Credit Analysts for its SME and mid-market corporate banking division.' },
    { id:114, title:'Actuary',                        company:'LIC of India',            companyAbout:'LIC is India\'s largest insurance company managing ₹40+ lakh crore in assets and serving 280 million+ policyholders.',                   state:'Maharashtra',            country:'India',        salary:'₹15–35 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['Actuarial Science','FIAI','Pricing','Reserving'], roles:['Product pricing','Reserving','Solvency reporting','Regulatory submissions'],              desc:'LIC Mumbai is hiring qualified Actuaries (FIAI/AIAI) for its actuarial department managing valuation and product development.' },
    { id:115, title:'Private Equity Analyst',         company:'ChrysCapital',            companyAbout:'ChrysCapital is one of India\'s premier private equity funds with $5B+ in AUM investing across healthcare, BFSI, and technology.',       state:'Delhi',                  country:'India',        salary:'₹20–40 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['PE','M&A','LBO Modelling','Due Diligence'], roles:['Deal sourcing','Financial modelling','Due diligence','Portfolio monitoring'],              desc:'ChrysCapital Delhi is hiring PE Analysts for its investment team focused on growth-stage and buyout transactions in India.' },
    { id:116, title:'Compliance Officer – SEBI',      company:'Axis Bank',               companyAbout:'Axis Bank is India\'s third-largest private bank with 5,000+ branches and a market cap of ₹3+ lakh crore.',                              state:'Maharashtra',            country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['SEBI Regulations','AMFI','Compliance','Risk'], roles:['Regulatory monitoring','Compliance reporting','Policy updates','SEBI liaison'],            desc:'Axis Bank Mumbai is hiring a Compliance Officer for its SEBI and capital markets compliance function.' },
    { id:117, title:'Wealth Manager',                 company:'IIFL Wealth',             companyAbout:'IIFL Wealth is one of India\'s largest wealth management firms managing ₹4+ lakh crore for HNI and UHNI clients.',                       state:'Maharashtra',            country:'India',        salary:'₹12–30 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['CFP','HNI Wealth','Portfolio Management','Estate Planning'], roles:['Client acquisition','Investment advisory','Portfolio review','Goal-based planning'],  desc:'IIFL Wealth Mumbai is hiring Wealth Managers to grow and manage portfolios for high-net-worth individuals.' },
    { id:118, title:'Financial Planning Analyst',     company:'Bajaj Finance',           companyAbout:'Bajaj Finance is one of India\'s largest NBFCs with 75 million+ customers and a diversified consumer and commercial lending portfolio.', state:'Maharashtra',            country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['FP&A','Excel','SQL','MIS Reporting'],   roles:['Budget preparation','Monthly MIS','Variance analysis','Business partnering'],                    desc:'Bajaj Finance Pune is hiring FP&A Analysts to support business finance teams across consumer and commercial lending.' },
    { id:119, title:'GST Consultant',                 company:'KPMG India',              companyAbout:'KPMG India is a Big Four firm with 20,000+ professionals offering tax, audit, and advisory services across all major Indian cities.',      state:'Karnataka',              country:'India',        salary:'₹10–20 LPA',            visa:false, sector:'Finance',     type:'Full-time', tags:['GST','Indirect Tax','Litigation','CA'], roles:['GST advisory','Return filings','Appeals','Tax planning'],                                         desc:'KPMG India Bengaluru is hiring GST Consultants for its indirect tax practice serving large manufacturing and services clients.' },
    { id:120, title:'Forex Dealer',                   company:'Yes Bank',                companyAbout:'Yes Bank is a full-service commercial bank with a significant presence in corporate banking, retail banking, and treasury operations.',    state:'Maharashtra',            country:'India',        salary:'₹8–16 LPA',             visa:false, sector:'Finance',     type:'Full-time', tags:['FX Trading','Bloomberg','Reuters','Hedging'], roles:['Currency dealing','Client FX execution','P&L monitoring','Risk reporting'],               desc:'Yes Bank Mumbai is hiring Forex Dealers for its treasury front office managing interbank and client FX transactions.' },

    /* Marketing – 15 roles */
    { id:121, title:'Digital Marketing Manager',      company:'Swiggy',                  companyAbout:'Swiggy is India\'s leading on-demand food delivery platform with 300,000+ restaurant partners and operations in 500+ cities.',            state:'Karnataka',              country:'India',        salary:'₹15–28 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['Performance Marketing','Google Ads','Meta Ads','SQL'], roles:['Campaign strategy','Budget management','Funnel optimization','Team leadership'],        desc:'Swiggy Bengaluru is hiring a Digital Marketing Manager to drive customer acquisition and retention across its platform.' },
    { id:122, title:'Brand Manager',                  company:'Hindustan Unilever',      companyAbout:'HUL is India\'s largest FMCG company with 50+ brands across foods, home care, and personal care serving 1 billion+ consumers.',         state:'Maharashtra',            country:'India',        salary:'₹18–30 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['Brand Strategy','P&L','ATL/BTL','IIM/FMS MBA'], roles:['Brand P&L management','Campaign development','Innovation pipeline','Agency management'], desc:'HUL Mumbai is hiring Brand Managers for its personal care and beauty portfolio from top B-school graduates.' },
    { id:123, title:'SEO Specialist',                 company:'Nykaa',                   companyAbout:'Nykaa is India\'s leading beauty and lifestyle eCommerce platform with 3 million+ SKUs and 30+ million monthly active users.',            state:'Maharashtra',            country:'India',        salary:'₹8–14 LPA',             visa:false, sector:'Marketing',   type:'Full-time', tags:['SEO','Ahrefs','Screaming Frog','Content Strategy'], roles:['Keyword research','On-page optimisation','Link building','Analytics reporting'],         desc:'Nykaa Mumbai is hiring an SEO Specialist to improve organic rankings across its beauty, fashion, and wellness categories.' },
    { id:124, title:'Content Marketing Lead',         company:'Byju\'s',                 companyAbout:'Byju\'s is the world\'s largest EdTech company with 150 million+ learners and a presence in 100+ countries.',                           state:'Karnataka',              country:'India',        salary:'₹12–20 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['Content Strategy','SEO','Storytelling','EdTech'], roles:['Content calendar','Long-form writing','SEO content','Social strategy'],                  desc:'Byju\'s Bengaluru is hiring a Content Marketing Lead to build thought leadership and drive organic growth.' },
    { id:125, title:'Growth Hacker',                  company:'CRED',                    companyAbout:'CRED is a fintech unicorn rewarding creditworthy Indians with exclusive benefits and services, with 12 million+ premium members.',        state:'Karnataka',              country:'India',        salary:'₹18–32 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['Growth Marketing','A/B Testing','Product Analytics','SQL'], roles:['Experiment design','Funnel analysis','Referral programs','Retention campaigns'],    desc:'CRED Bengaluru is hiring a Growth Hacker to design and run experiments that improve member acquisition and engagement.' },
    { id:126, title:'Social Media Manager',           company:'Zomato',                  companyAbout:'Zomato is India\'s leading food delivery and dining-out platform with operations in India, the UAE, and other international markets.',    state:'Haryana',                country:'India',        salary:'₹8–15 LPA',             visa:false, sector:'Marketing',   type:'Full-time', tags:['Instagram','Twitter','Viral Content','Community Management'], roles:['Content creation','Campaign execution','Community engagement','Brand voice'],    desc:'Zomato Gurugram is hiring a Social Media Manager to continue its award-winning social media presence and brand storytelling.' },
    { id:127, title:'Marketing Analytics Manager',    company:'Amazon India',            companyAbout:'Amazon India is one of the largest e-commerce platforms in India with millions of sellers and a growing advertising business.',           state:'Karnataka',              country:'India',        salary:'₹20–38 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['SQL','Python','Tableau','Marketing Mix Modelling'], roles:['Campaign attribution','Spend optimization','Dashboard development','Stakeholder reporting'], desc:'Amazon India Bengaluru is hiring a Marketing Analytics Manager to optimise advertising ROI across categories.' },
    { id:128, title:'Performance Marketing Lead',     company:'MakeMyTrip',              companyAbout:'MakeMyTrip is India\'s leading online travel company with 300 million+ app downloads and operations across flights, hotels, and holidays.', state:'Haryana',               country:'India',        salary:'₹15–28 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['PPC','Meta Ads','Google UAC','ASO'],    roles:['Paid media strategy','Budget optimization','Creative testing','ROI reporting'],                  desc:'MakeMyTrip Gurugram is hiring a Performance Marketing Lead to drive app installs and transactional growth through paid channels.' },
    { id:129, title:'PR Manager',                     company:'Reliance Jio',            companyAbout:'Reliance Jio is India\'s largest telecom company with 450+ million subscribers and a growing digital services ecosystem.',                 state:'Maharashtra',            country:'India',        salary:'₹15–25 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['PR','Media Relations','Crisis Comms','Corporate Comms'], roles:['Press releases','Media liaison','Crisis management','Brand reputation'],              desc:'Reliance Jio Mumbai is hiring a PR Manager to manage corporate communications, media relations, and brand positioning.' },
    { id:130, title:'Product Marketing Manager',      company:'PhonePe',                 companyAbout:'PhonePe is India\'s leading UPI payments app with 500+ million registered users and 30+ financial services.',                             state:'Karnataka',              country:'India',        salary:'₹18–35 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['Product Marketing','Go-to-Market','User Research','Messaging'], roles:['GTM strategy','Product launches','Positioning','Customer insights'],                desc:'PhonePe Bengaluru is hiring a Product Marketing Manager to lead go-to-market strategy for its payments and financial products.' },
    { id:131, title:'CRM Manager',                    company:'Myntra',                  companyAbout:'Myntra is India\'s largest fashion eCommerce platform with 50+ million active customers and 6,000+ brands.',                              state:'Karnataka',              country:'India',        salary:'₹12–22 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['CRM','Lifecycle Marketing','Clevertap','SQL'], roles:['User segmentation','Email/push campaigns','Retention strategy','A/B testing'],            desc:'Myntra Bengaluru is hiring a CRM Manager to manage lifecycle marketing for its 50 million+ customer base.' },
    { id:132, title:'Influencer Marketing Manager',   company:'Mamaearth',               companyAbout:'Mamaearth is a FMCG unicorn that built India\'s fastest-growing personal care brand with revenue crossing ₹1,000 crore through D2C.',   state:'Haryana',                country:'India',        salary:'₹10–18 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['Influencer Marketing','D2C','Social Media','Negotiation'], roles:['Influencer identification','Contract negotiations','Campaign execution','ROI tracking'], desc:'Mamaearth Gurugram is hiring an Influencer Marketing Manager to manage creator partnerships across beauty and personal care.' },
    { id:133, title:'Market Research Analyst',        company:'Nielsen India',           companyAbout:'Nielsen India is the world\'s leading data measurement company providing consumer insights for FMCG, media, and retail sectors.',          state:'Maharashtra',            country:'India',        salary:'₹8–15 LPA',             visa:false, sector:'Marketing',   type:'Full-time', tags:['Market Research','SPSS','Survey Design','FMCG Insights'], roles:['Consumer surveys','Data analysis','Report writing','Client presentations'],            desc:'Nielsen India Mumbai is hiring Market Research Analysts for its consumer insights division serving major FMCG brands.' },
    { id:134, title:'Trade Marketing Executive',      company:'ITC Limited',             companyAbout:'ITC Limited is a diversified Indian conglomerate with major businesses in FMCG, hospitality, packaging, and agribusiness.',               state:'West Bengal',            country:'India',        salary:'₹6–12 LPA',             visa:false, sector:'Marketing',   type:'Full-time', tags:['FMCG','Trade Marketing','BTL','Modern Trade'], roles:['In-store activation','Merchandising','Trade schemes','Distributor management'],           desc:'ITC Limited Kolkata is hiring Trade Marketing Executives to drive shelf presence and sales across general and modern trade.' },
    { id:135, title:'Category Manager – eCommerce',   company:'Reliance Retail',         companyAbout:'Reliance Retail is India\'s largest retailer with 18,000+ stores across formats including JioMart, Smart Bazaar, and Trends.',           state:'Maharashtra',            country:'India',        salary:'₹15–28 LPA',            visa:false, sector:'Marketing',   type:'Full-time', tags:['Category Management','Merchandising','P&L','JioMart'], roles:['Category P&L','Vendor negotiations','Assortment planning','Pricing strategy'],         desc:'Reliance Retail Mumbai is hiring Category Managers for its JioMart eCommerce business across FMCG, fashion, and electronics.' },

    /* Engineering – 15 roles */
    { id:136, title:'Mechanical Design Engineer',     company:'Mahindra Engineering',    companyAbout:'Mahindra Engineering Services is a leading ER&D firm providing engineering design and simulation services to global OEMs.',              state:'Maharashtra',            country:'India',        salary:'₹8–16 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['CATIA V5','SolidWorks','GD&T','DFMEA'], roles:['CAD modelling','Design reviews','BOM management','Tooling support'],                          desc:'Mahindra Engineering Pune is hiring Mechanical Design Engineers for automotive body and chassis design projects.' },
    { id:137, title:'Civil Project Engineer',         company:'Larsen & Toubro',         companyAbout:'L&T Construction is one of the world\'s top construction conglomerates building infrastructure, buildings, and industrial projects.',    state:'Tamil Nadu',             country:'India',        salary:'₹7–14 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['AutoCAD','MS Project','Primavera','Quantity Surveying'], roles:['Site supervision','BOQ preparation','Safety management','Subcontractor coordination'], desc:'L&T Construction Chennai is hiring Civil Project Engineers for its buildings and factories division across South India.' },
    { id:138, title:'Electrical Engineer – Power',    company:'Power Grid Corporation',  companyAbout:'Power Grid Corporation is a Maharatna central PSU managing India\'s National Power Grid spanning 1,70,000+ circuit kilometres.',       state:'Haryana',                country:'India',        salary:'₹8–15 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['HV Transmission','SCADA','Power Systems','AutoCAD Electrical'], roles:['Line design','Substation engineering','Fault analysis','Project execution'],       desc:'Power Grid Corporation Gurugram is hiring Electrical Engineers for its transmission line and substation projects across India.' },
    { id:139, title:'Automation Engineer',            company:'ABB India',               companyAbout:'ABB India is a global technology leader in electrification and automation with 10,000+ employees and manufacturing across India.',         state:'Karnataka',              country:'India',        salary:'₹9–18 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['PLC','SCADA','Drives','Instrumentation'],roles:['System design','PLC programming','Commissioning','Customer support'],                          desc:'ABB India Bengaluru is hiring Automation Engineers for its process automation and energy management systems division.' },
    { id:140, title:'Structural Engineer',            company:'Shapoorji Pallonji',      companyAbout:'Shapoorji Pallonji is one of India\'s oldest and largest construction and engineering companies with projects across 70+ countries.',    state:'Maharashtra',            country:'India',        salary:'₹8–16 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['Revit','ETABS','STAAD Pro','RCC Design'], roles:['Structural analysis','Drawing preparation','Site visits','Vendor coordination'],          desc:'Shapoorji Pallonji Mumbai is hiring Structural Engineers for high-rise residential and commercial building projects.' },
    { id:141, title:'Environmental Engineer',         company:'EIL (Engineers India Ltd)', companyAbout:'Engineers India Limited is a Navratna PSU providing consultancy and engineering services for refineries, petrochemicals, and infrastructure.', state:'Delhi',               country:'India',        salary:'₹8–16 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['EIA','Effluent Treatment','ISO 14001','Environmental Monitoring'], roles:['EIA preparation','Pollution control','Regulatory compliance','Client reporting'], desc:'EIL New Delhi is hiring Environmental Engineers for its refinery and petrochemical consultancy projects.' },
    { id:142, title:'Marine Engineer',                company:'Mazagon Dock',            companyAbout:'Mazagon Dock Shipbuilders Limited is India\'s premier defence shipyard in Mumbai building warships and submarines for the Indian Navy.',  state:'Maharashtra',            country:'India',        salary:'₹9–18 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['Marine Engineering','Ship Design','CAD','DNV/BV Class'], roles:['Ship system design','Machinery integration','Sea trials support','Documentation'],    desc:'Mazagon Dock Mumbai is hiring Marine Engineers for warship and submarine design and build programmes.' },
    { id:143, title:'HVAC Design Engineer',           company:'Voltas',                  companyAbout:'Voltas is India\'s largest air conditioning and engineering services company, a Tata enterprise, with 10,000+ employees.',               state:'Maharashtra',            country:'India',        salary:'₹7–14 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['HVAC','HAP','Chiller Design','MEP Coordination'], roles:['System design','Load calculations','BOQ preparation','Commissioning'],               desc:'Voltas Mumbai is hiring HVAC Design Engineers for its projects division handling commercial, industrial, and data centre projects.' },
    { id:144, title:'Reliability Engineer',           company:'ONGC',                    companyAbout:'Oil and Natural Gas Corporation is India\'s largest government-owned oil & gas company with upstream operations across India and globally.', state:'Gujarat',              country:'India',        salary:'₹10–20 LPA',            visa:false, sector:'Engineering', type:'Full-time', tags:['RCM','FMEA','Predictive Maintenance','Oil & Gas'], roles:['Equipment reliability analysis','FMEA studies','Condition monitoring','Shutdown planning'], desc:'ONGC Vadodara is hiring Reliability Engineers for its oil and gas processing facilities in the Western Offshore region.' },
    { id:145, title:'Welding & QC Inspector',         company:'BHEL',                    companyAbout:'Bharat Heavy Electricals Limited is a Maharatna PSU and India\'s largest power equipment manufacturer with 14 manufacturing units.',    state:'Telangana',              country:'India',        salary:'₹6–12 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['ASME','NDT','CSWIP 3.1','Welding QC'],  roles:['Weld inspection','NDT coordination','Procedure qualification','Audit compliance'],                desc:'BHEL Hyderabad is hiring Welding QC Inspectors for its power plant boiler and turbine manufacturing division.' },
    { id:146, title:'Geotechnical Engineer',          company:'RITES Ltd.',              companyAbout:'RITES is a Miniratna PSU and a multi-disciplinary consultancy offering transport infrastructure and engineering services.',                state:'Haryana',                country:'India',        salary:'₹8–15 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['Geotechnical Investigations','Pile Design','PLAXIS','Soil Mechanics'], roles:['Site investigation','Foundation design','Lab testing','Report writing'],            desc:'RITES Ltd. Gurugram is hiring Geotechnical Engineers for rail, road, and airport infrastructure projects across India.' },
    { id:147, title:'Quantity Surveyor',              company:'DLF Limited',             companyAbout:'DLF is India\'s largest real estate developer with a portfolio of 165 million sq ft of planned development across luxury and commercial segments.', state:'Haryana',           country:'India',        salary:'₹8–15 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['BOQ','Rate Analysis','Primavera','Cost Control'], roles:['Quantity estimation','Bill certification','Variation orders','Cost reporting'],           desc:'DLF Gurugram is hiring Quantity Surveyors for high-rise residential and commercial real estate projects across NCR.' },
    { id:148, title:'Piping Engineer',                company:'Toyo Engineering India',  companyAbout:'Toyo Engineering India is a leading EPC contractor specializing in oil & gas, petrochemical, and fertilizer plants.',                    state:'Maharashtra',            country:'India',        salary:'₹9–18 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['Piping Design','PDMS','Caesar II','PID'], roles:['Pipe stress analysis','Isometric drawing','MTO preparation','Vendor review'],             desc:'Toyo Engineering Navi Mumbai is hiring Piping Engineers for EPC projects in the petrochemical and fertilizer sector.' },
    { id:149, title:'Solar Project Engineer',         company:'Adani Green Energy',      companyAbout:'Adani Green Energy is one of the world\'s largest renewable energy companies with 25 GW+ of solar and wind projects across India.',      state:'Gujarat',                country:'India',        salary:'₹8–16 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['Solar PV','SCADA','Grid Compliance','ETAP'], roles:['Project commissioning','Grid integration','Performance monitoring','O&M planning'],     desc:'Adani Green Energy Ahmedabad is hiring Solar Project Engineers for its utility-scale solar farm portfolio across Rajasthan and Gujarat.' },
    { id:150, title:'Production Engineer – Auto',     company:'Maruti Suzuki',           companyAbout:'Maruti Suzuki is India\'s largest car manufacturer with 50% domestic market share and annual production of 2 million+ vehicles.',        state:'Haryana',                country:'India',        salary:'₹7–14 LPA',             visa:false, sector:'Engineering', type:'Full-time', tags:['Lean Manufacturing','Kaizen','Automotive Ops','SAP PP'], roles:['Production planning','Line balancing','Quality improvement','OEE tracking'],          desc:'Maruti Suzuki Manesar is hiring Production Engineers for its car assembly plant and component manufacturing lines.' },
  ];

  // Salary band helper — rough USD-equivalent bucketing for display filter
  const salaryBands = ['All', 'Entry (< ₹8L / €40K)', 'Mid (₹8–20L / €40–70K)', 'Senior (₹20–40L / €70–100K)', 'Lead (> ₹40L / €100K+)'];
  useEffect(() => { setJobPage(1); }, [jobFilters, jobSort]);
  const salaryInBand = (salary, band) => {
    if (band === 'All') return true;
    const s = salary.toLowerCase();
    // India rupees
    if (s.includes('lpa') || s.includes('₹')) {
      const nums = (s.match(/[\d.]+/g) || []).map(Number).filter(Boolean);
      const lo = Math.min(...nums);
      if (band.startsWith('Entry'))  return lo < 8;
      if (band.startsWith('Mid'))    return lo >= 8  && lo < 20;
      if (band.startsWith('Senior')) return lo >= 20 && lo < 40;
      if (band.startsWith('Lead'))   return lo >= 40;
    }
    // Europe/international (€, £, $, AUD, CAD, SGD in thousands)
    const nums = (s.match(/[\d,]+/g) || []).map(n => parseInt(n.replace(/,/g,''))).filter(Boolean);
    const lo = Math.min(...nums);
    if (band.startsWith('Entry'))  return lo < 40000;
    if (band.startsWith('Mid'))    return lo >= 40000 && lo < 70000;
    if (band.startsWith('Senior')) return lo >= 70000 && lo < 100000;
    if (band.startsWith('Lead'))   return lo >= 100000;
    return true;
  };

  const filtered = useMemo(() => {
    let results = JOBS.filter(j => {
      const titleMatch   = !jobFilters.title   || j.title.toLowerCase().includes(jobFilters.title.toLowerCase());
      const companyMatch = !jobFilters.company || j.company.toLowerCase().includes(jobFilters.company.toLowerCase());
      const countryMatch = !jobFilters.country || j.country.toLowerCase().includes(jobFilters.country.toLowerCase());
      const sectorMatch  = jobFilters.sector === 'All' || j.sector === jobFilters.sector;
      const visaMatch    = jobFilters.visa === 'All' || (jobFilters.visa === 'Yes' ? j.visa : !j.visa);
      const salaryMatch  = salaryInBand(j.salary, jobFilters.salaryBand);
      return titleMatch && companyMatch && countryMatch && sectorMatch && visaMatch && salaryMatch;
    });
    if (jobSort === 'title-az')   results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    if (jobSort === 'title-za')   results = [...results].sort((a, b) => b.title.localeCompare(a.title));
    if (jobSort === 'company-az') results = [...results].sort((a, b) => a.company.localeCompare(b.company));
    if (jobSort === 'visa-first') results = [...results].sort((a, b) => (b.visa ? 1 : 0) - (a.visa ? 1 : 0));
    if (jobSort === 'saved-first') results = [...results].sort((a, b) => (saved.includes(b.id) ? 1 : 0) - (saved.includes(a.id) ? 1 : 0));
    return results;
  }, [jobFilters, jobSort, saved]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / JOBS_PER_PAGE));
  const safeJobPage  = Math.min(jobPage, totalPages);
  const pagedJobs    = filtered.slice((safeJobPage - 1) * JOBS_PER_PAGE, safeJobPage * JOBS_PER_PAGE);

  /* ── Toast helper ── */
  const pushToast = (icon, title, body) => {
    const id = Date.now();
    setToasts(t => [...t, { id, icon, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  /* ── Fake resume analysis ── */
  const runAnalysis = () => {
    if (!uploadName && !resume) {
      pushToast('⚠️', 'No resume', 'Please upload a resume first');
      return;
    }
    setAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setAnalysisResult({
        atsScore: 84,
        readability: 78,
        keywords: 91,
        formatting: 72,
        suggestions: [
          'Add measurable achievements (e.g. "reduced load time by 40%")',
          'Include LinkedIn and GitHub profile links',
          'Use more action verbs: "architected", "delivered", "optimized"',
          'Add a concise professional summary at the top',
        ],
        missingKeywords: ['CI/CD', 'Agile', 'REST APIs', 'Docker'],
        topKeywords: ['React', 'JavaScript', 'Node.js', 'TypeScript'],
      });
      setAnalyzing(false);
      pushToast('🏆', 'Analysis complete', 'Your ATS score is 84 — well done!');
    }, 2200);
  };

  /* ── AI Recs — match from internal JOBS list ── */
  const fetchAiRecs = () => {
    setAiLoading(true);
    setAiJobs([]);
    setTimeout(() => {
      const roleQ = (aiPrefs.role || '').toLowerCase();
      const locQ  = (aiPrefs.location || '').toLowerCase();
      const secQ  = aiPrefs.sector || 'All';
      const visaQ = aiPrefs.visa || 'Any';

      const scored = JOBS.map(j => {
        let score = 60;
        const haystack = `${j.title} ${j.tags.join(' ')} ${j.sector} ${j.desc}`.toLowerCase();
        if (roleQ && haystack.includes(roleQ)) score += 25;
        if (locQ  && `${j.state} ${j.country}`.toLowerCase().includes(locQ)) score += 10;
        if (secQ !== 'All' && j.sector === secQ) score += 10;
        if (visaQ === 'Yes' && j.visa) score += 5;
        if (visaQ === 'No'  && !j.visa) score += 5;
        score = Math.min(99, score + Math.floor(Math.random() * 8));
        return { ...j, match: score };
      });

      const results = scored
        .filter(j => j.match >= 65)
        .sort((a, b) => b.match - a.match)
        .slice(0, 12);

      setAiJobs(results);
      setAiLoading(false);
      pushToast('🤖', 'AI Matches ready', `${results.length} jobs matched from our listings`);
    }, 1800);
  };

  /* ── Add interview ── */
  const addInterview = () => {
    if (!newInterview.company || !newInterview.date) return;
    setInterviews(prev => [...prev, { ...newInterview, id: Date.now(), status: 'Pending' }]);
    setNewInterview({ company: '', role: '', date: '', time: '', type: 'Video' });
    pushToast('📅', 'Interview scheduled', `${newInterview.company} on ${newInterview.date}`);
  };

  const [navOpen, setNavOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { id: 'home', label: '🏠 Home' },
    { id: 'jobs', label: '💼 Jobs' },
    { id: 'ai-recs', label: '🤖 AI Match' },
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'tracker',   label: '🗂️ Tracker' },
    { id: 'profile', label: '👤 Profile' },
    { id: 'resume-score', label: '📄 Score' },
    { id: 'interviews', label: '📅 Interviews' },
    { id: 'pricing', label: '💳 Pricing' },
    { id: 'addons', label: '⚡ Add-ons' },
    { id: 'network', label: '🌐 Network' },
    { id: 'recruiter', label: '🏢 Recruiter' },
    { id: 'admin', label: '🛡 Admin' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <style>{styleSheet}</style>

      {/* ── TOASTS ── */}
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map(n => (
          <div key={n.id} style={{
            background: '#1e293b', border: '1.5px solid #334155',
            borderRadius: 14, padding: '14px 18px', minWidth: 280,
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,.4)',
            animation: 'slideInRight 0.4s cubic-bezier(.17,.67,.35,1.1) both',
          }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{n.title}</div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{n.body}</div>
            </div>
            <button onClick={() => setToasts(t => t.filter(x => x.id !== n.id))} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        ))}
      </div>

      {/* ── HEADER ── */}
      <header style={{
        background: 'rgba(2,8,23,.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 100,
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, height: 60, overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16, flexShrink: 0, cursor: 'pointer' }} onClick={() => setPage('home')}>
            <img
              src="data:image/png;base64,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"
              alt="GlobalPort logo"
              style={{ height: 46, width: 46, objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', letterSpacing: '-0.5px', color: '#f1f5f9' }}>
              Global<span style={{ color: '#818cf8' }}>Port</span>
            </span>
          </div>
          {nav.map(n => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              className="nav-link"
              style={{
                background: page === n.id ? 'rgba(99,102,241,.15)' : 'none',
                border: 'none', cursor: 'pointer',
                color: page === n.id ? '#818cf8' : '#64748b',
                padding: '6px 12px', borderRadius: 10, fontSize: 13,
                fontWeight: page === n.id ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'all .15s',
              }}
            >
              {n.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <button
                onClick={() => setUser(null)}
                style={{ background: '#1e293b', border: '1.5px solid #334155', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', color: '#e2e8f0', fontSize: 13 }}
              >
                👤 {user.name}
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)} className="btn-primary" style={{ borderRadius: 12, padding: '7px 16px', fontSize: 13 }}>
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════ PAGES ══════════════════ */}

      {/* ── HOME ── */}
      {page === 'home' && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div className="fade-up">
              <div style={{ marginBottom: 16 }}>
                <Badge color="purple">AI-Powered • Global Jobs</Badge>
              </div>
              <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
                Land Your<br />
                <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Dream Job
                </span>{' '}
                Globally
              </h1>
              <p style={{ color: '#64748b', fontSize: 18, lineHeight: 1.7, marginBottom: 32 }}>
                AI-matched opportunities, resume scoring, interview scheduling — everything to get you hired faster.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setPage('ai-recs')} className="btn-primary" style={{ padding: '14px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600 }}>
                  🤖 Get AI Matches
                </button>
                <button onClick={() => setPage('jobs')} className="btn-ghost" style={{ padding: '14px 28px', borderRadius: 14, fontSize: 15 }}>
                  Browse Jobs →
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: '10K+', sub: 'Candidates', icon: '👥', color: '#6366f1', delay: 0 },
                { label: '1K+', sub: 'Recruiters', icon: '🏢', color: '#a78bfa', delay: 100 },
                { label: 'AI', sub: 'Job Matching', icon: '🤖', color: '#38bdf8', delay: 200 },
                { label: '97%', sub: 'Match Accuracy', icon: '🎯', color: '#4ade80', delay: 300 },
              ].map(s => (
                <div key={s.label} className="fade-up card-hover" style={{ ...card, textAlign: 'center', padding: 28, animationDelay: `${s.delay}ms` }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.label}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── JOB DETAIL MODAL ── */}
      {selectedJob && (
        <div
          className="fade-up"
          onClick={e => { if (e.target === e.currentTarget) setSelectedJob(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 500, overflowY: 'auto', padding: '40px 24px' }}
        >
          <div className="pop-in" style={{ maxWidth: 740, margin: '0 auto', background: '#0f172a', border: '1.5px solid #1e293b', borderRadius: 24, padding: 36, boxShadow: '0 32px 80px rgba(0,0,0,.6)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <Badge color="blue">{selectedJob.sector}</Badge>
                  <Badge color={selectedJob.visa ? 'green' : 'red'}>{selectedJob.visa ? '✈️ Visa Sponsored' : '🚫 No Visa'}</Badge>
                  <Badge color="slate">{selectedJob.type}</Badge>
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 26, marginBottom: 4 }}>{selectedJob.title}</h2>
                <p style={{ color: '#64748b', fontSize: 15 }}>{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: '#1e293b', border: 'none', color: '#94a3b8', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>

            {/* Location & Salary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
              {[
                { icon: '📍', label: 'Location', value: `${selectedJob.state}, ${selectedJob.country}` },
                { icon: '💰', label: 'Salary', value: selectedJob.salary },
                { icon: '✈️', label: 'Visa Sponsorship', value: selectedJob.visa ? 'Yes — Provided' : 'Not Available' },
              ].map(s => (
                <div key={s.label} style={{ background: '#020817', borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ color: '#475569', fontSize: 11, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Job Description */}
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, color: '#6366f1' }}>About the Role</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14 }}>{selectedJob.desc}</p>
            </div>

            {/* Key Responsibilities */}
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, color: '#a78bfa' }}>Key Responsibilities</h3>
              {selectedJob.roles.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 14, marginTop: 1 }}>{i + 1}.</span>
                  <span style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>{r}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div style={{ marginBottom: 22 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 10, color: '#38bdf8' }}>Required Skills</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedJob.tags.map(t => <Badge key={t} color="blue">{t}</Badge>)}
              </div>
            </div>

            {/* About Company */}
            <div style={{ background: '#020817', borderRadius: 16, padding: '18px 20px', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#4ade80' }}>🏢 About {selectedJob.company}</h3>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.75 }}>{selectedJob.companyAbout}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                onClick={() => setSaved(saved.includes(selectedJob.id) ? saved.filter(x => x !== selectedJob.id) : [...saved, selectedJob.id])}
                className="btn-ghost"
                style={{ padding: '13px 0', borderRadius: 14, fontSize: 14 }}
              >
                {saved.includes(selectedJob.id) ? '💾 Saved' : '🔖 Save Job'}
              </button>
              <button
                onClick={() => {
                  setApplied(prev => prev.includes(selectedJob.id) ? prev : [...prev, selectedJob.id]);
                  if (!applied.includes(selectedJob.id)) pushToast('✅', 'Applied!', `Application sent to ${selectedJob.company}`);
                  setSelectedJob(null);
                }}
                className="btn-primary"
                style={{ padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 600 }}
              >
                {applied.includes(selectedJob.id) ? '✅ Already Applied' : '🚀 Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── JOBS ── */}
      {page === 'jobs' && (
        <section style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 24px' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Browse Jobs</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>🌍 150+ international opportunities for Indian professionals</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ color: '#475569', fontSize: 13 }}>{filtered.length} results</span>
              {/* Sort dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <label style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', letterSpacing: '.05em' }}>SORT BY</label>
                <select
                  value={jobSort}
                  onChange={e => setJobSort(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 12.5, padding: '7px 10px', minWidth: 170 }}
                >
                  <option value="default">Default</option>
                  <option value="title-az">Title A → Z</option>
                  <option value="title-za">Title Z → A</option>
                  <option value="company-az">Company A → Z</option>
                  <option value="visa-first">Visa Sponsored First</option>
                  <option value="saved-first">Saved First</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Filters ── */}
          <AnimatedCard style={{ marginBottom: 24, padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: 1 }}>JOB TITLE</label>
                <input value={jobFilters.title} onChange={e => setJobFilters(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Nurse, Java Dev…" className="input-field" style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: 1 }}>COMPANY</label>
                <input value={jobFilters.company} onChange={e => setJobFilters(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Google, NHS…" className="input-field" style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: 1 }}>COUNTRY / STATE</label>
                <input value={jobFilters.country} onChange={e => setJobFilters(f => ({ ...f, country: e.target.value }))} placeholder="e.g. Canada, India…" className="input-field" style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: 1 }}>SECTOR</label>
                <select value={jobFilters.sector} onChange={e => setJobFilters(f => ({ ...f, sector: e.target.value }))} className="input-field" style={{ fontSize: 13 }}>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: 1 }}>SALARY RANGE</label>
                <select value={jobFilters.salaryBand} onChange={e => setJobFilters(f => ({ ...f, salaryBand: e.target.value }))} className="input-field" style={{ fontSize: 12 }}>
                  {salaryBands.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: 1 }}>VISA SPONSORED</label>
                <select value={jobFilters.visa} onChange={e => setJobFilters(f => ({ ...f, visa: e.target.value }))} className="input-field" style={{ fontSize: 13 }}>
                  <option>All</option><option>Yes</option><option>No</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => { setJobFilters({ title: '', company: '', country: '', sector: 'All', visa: 'All', salaryBand: 'All' }); setJobSort('default'); }}
                  className="btn-ghost"
                  style={{ width: '100%', padding: '12px 0', borderRadius: 12, fontSize: 13 }}
                >
                  ↺ Reset All
                </button>
              </div>
            </div>
          </AnimatedCard>

          {/* ── Job Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 18 }}>
            {pagedJobs.map((j, i) => (
              <AnimatedCard key={j.id} delay={(i % 20) * 40} style={{ cursor: 'pointer' }} onClick={() => setSelectedJob(j)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 3, lineHeight: 1.3 }}>{j.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 13 }}>{j.company}</p>
                  </div>
                  <Badge color={j.visa ? 'green' : 'red'}>{j.visa ? '✈️ Visa' : 'No Visa'}</Badge>
                </div>

                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  <Badge color="slate">📍 {j.state}, {j.country}</Badge>
                  <Badge color="blue">{j.sector}</Badge>
                </div>

                <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{j.salary}</p>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {j.tags.slice(0, 3).map(t => <Badge key={t} color="purple">{t}</Badge>)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); setSaved(saved.includes(j.id) ? saved.filter(x => x !== j.id) : [...saved, j.id]); }}
                    className="btn-ghost"
                    style={{ padding: '9px 0', borderRadius: 10, fontSize: 12 }}
                  >
                    {saved.includes(j.id) ? '💾 Saved' : '🔖 Save'}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setApplied(prev => prev.includes(j.id) ? prev : [...prev, j.id]); if (!applied.includes(j.id)) pushToast('✅', 'Applied!', `Sent to ${j.company}`); }}
                    className="btn-primary"
                    style={{ padding: '9px 0', borderRadius: 10, fontSize: 12 }}
                  >
                    {applied.includes(j.id) ? '✅ Applied' : 'Apply →'}
                  </button>
                </div>
                <p style={{ color: '#334155', fontSize: 11, marginTop: 8, textAlign: 'center' }}>Click card to view full details</p>
              </AnimatedCard>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#475569' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 16 }}>No jobs match your filters. Try adjusting your search.</p>
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 36, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setJobPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={safeJobPage === 1}
                className="btn-ghost"
                style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, opacity: safeJobPage === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                const isNear = p === 1 || p === totalPages || Math.abs(p - safeJobPage) <= 1;
                const isEllipsisBefore = p === safeJobPage - 2 && safeJobPage > 4;
                const isEllipsisAfter  = p === safeJobPage + 2 && safeJobPage < totalPages - 3;
                if (isEllipsisBefore || isEllipsisAfter) return <span key={p} style={{ color: '#334155', fontSize: 13 }}>…</span>;
                if (!isNear) return null;
                return (
                  <button
                    key={p}
                    onClick={() => { setJobPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{
                      width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: p === safeJobPage ? 700 : 400,
                      background: p === safeJobPage ? 'rgba(99,102,241,.9)' : '#0f172a',
                      color: p === safeJobPage ? '#fff' : '#64748b',
                      transition: 'all .15s',
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => { setJobPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={safeJobPage === totalPages}
                className="btn-ghost"
                style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, opacity: safeJobPage === totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>

              <span style={{ color: '#475569', fontSize: 12, marginLeft: 8 }}>
                Page {safeJobPage} of {totalPages} · {filtered.length} jobs
              </span>
            </div>
          )}
        </section>
      )}

      {/* ── AI RECOMMENDATIONS ── */}
      {page === 'ai-recs' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🤖 AI Job Recommendations</h2>
          <p className="fade-up" style={{ color: '#64748b', marginBottom: 28 }}>Tell us your preferences — AI will match you from our live job listings only. No external jobs.</p>

          <AnimatedCard delay={0} style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#a78bfa' }}>Your Preferences</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Preferred Role / Keyword</label>
                <input value={aiPrefs.role} onChange={e => setAiPrefs({ ...aiPrefs, role: e.target.value })} className="input-field" style={{ fontSize: 13 }} placeholder="e.g. Nurse, Java, Chef…" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Preferred Country</label>
                <input value={aiPrefs.location} onChange={e => setAiPrefs({ ...aiPrefs, location: e.target.value })} className="input-field" style={{ fontSize: 13 }} placeholder="e.g. Canada, UAE…" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Sector</label>
                <select value={aiPrefs.sector || 'All'} onChange={e => setAiPrefs({ ...aiPrefs, sector: e.target.value })} className="input-field" style={{ fontSize: 13 }}>
                  {SECTORS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Visa Required?</label>
                <select value={aiPrefs.visa || 'Yes'} onChange={e => setAiPrefs({ ...aiPrefs, visa: e.target.value })} className="input-field" style={{ fontSize: 13 }}>
                  <option>Yes</option><option>No</option><option>Any</option>
                </select>
              </div>
            </div>
            <button onClick={fetchAiRecs} className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
              {aiLoading ? '⏳ Matching from job listings…' : '🚀 Find My Best Matches'}
            </button>
          </AnimatedCard>

          {aiLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ ...card, height: 180 }}>
                  <div className="shimmer-bg" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                  <div className="shimmer-bg" style={{ height: 14, width: '40%', marginBottom: 16 }} />
                  <div className="shimmer-bg" style={{ height: 10, width: '80%', marginBottom: 8 }} />
                  <div className="shimmer-bg" style={{ height: 10, width: '55%', marginBottom: 20 }} />
                  <div className="shimmer-bg" style={{ height: 36, width: '100%', borderRadius: 10 }} />
                </div>
              ))}
            </div>
          )}

          {!aiLoading && aiJobs.length > 0 && (
            <>
              <p className="fade-up" style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>
                ✅ Matched <strong style={{ color: '#6366f1' }}>{aiJobs.length} jobs</strong> from our listings based on your profile
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                {aiJobs.map((j, i) => (
                  <AnimatedCard key={j.id} delay={i * 70} style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedJob(j)}>
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      background: j.match >= 92 ? 'linear-gradient(135deg,#4ade80,#22c55e)' :
                        j.match >= 80 ? 'linear-gradient(135deg,#6366f1,#a78bfa)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                      color: '#fff', fontSize: 11, fontWeight: 800,
                      padding: '6px 14px', borderRadius: '0 20px 0 14px',
                    }}>
                      {j.match}% match
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, paddingRight: 80, lineHeight: 1.3 }}>{j.title}</h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>{j.company}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <Badge color="slate">📍 {j.state}, {j.country}</Badge>
                      <Badge color={j.visa ? 'green' : 'red'}>{j.visa ? '✈️ Visa' : 'No Visa'}</Badge>
                    </div>
                    <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{j.salary}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {j.tags.slice(0, 3).map(t => <Badge key={t} color="purple">{t}</Badge>)}
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setApplied(prev => prev.includes(j.id) ? prev : [...prev, j.id]);
                        if (!applied.includes(j.id)) pushToast('🎯', 'Applied via AI Match!', `Sent to ${j.company}`);
                      }}
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px 0', borderRadius: 12, fontSize: 13 }}
                    >
                      {applied.includes(j.id) ? '✅ Applied' : 'Quick Apply →'}
                    </button>
                  </AnimatedCard>
                ))}
              </div>
            </>
          )}

          {!aiLoading && aiJobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
              <p style={{ fontSize: 16, marginBottom: 8 }}>Set your preferences and hit "Find My Best Matches"</p>
              <p style={{ fontSize: 13 }}>AI will scan our {JOBS.length}+ live listings and rank the best ones for you</p>
            </div>
          )}
        </section>
      )}

      {/* ── RESUME SCORE ANALYZER ── */}
      {page === 'resume-score' && (
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>📄 Resume Score Analyzer</h2>
          <p className="fade-up" style={{ color: '#64748b', marginBottom: 32 }}>ATS-powered analysis that tells you exactly how to improve your resume.</p>

          {!analysisResult && !analyzing && (
            <AnimatedCard>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
                <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Analyze Your Resume</h3>
                <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
                  {uploadName ? `Resume loaded: ${uploadName}` : 'Upload your resume on the Profile page first, or click Analyze to demo'}
                </p>
                <button onClick={runAnalysis} className="btn-primary" style={{ padding: '14px 36px', borderRadius: 14, fontSize: 15, fontWeight: 600 }}>
                  🔍 Analyze Resume
                </button>
              </div>
            </AnimatedCard>
          )}

          {analyzing && (
            <AnimatedCard style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: 20 }}>⚙️</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Analyzing your resume…</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Checking ATS compatibility, keywords, formatting…</p>
              <div style={{ marginTop: 24 }}>
                {['Parsing content', 'Checking ATS keywords', 'Scoring formatting', 'Generating suggestions'].map((s, i) => (
                  <div key={s} className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 10, animationDelay: `${i * 350}ms` }}>
                    <div className="shimmer-bg" style={{ width: 18, height: 18, borderRadius: '50%' }} />
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>{s}</span>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {analysisResult && (
            <div style={{ display: 'grid', gap: 18 }}>
              {/* Scores row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[
                  { label: 'ATS Score', value: analysisResult.atsScore, color: '#6366f1' },
                  { label: 'Readability', value: analysisResult.readability, color: '#38bdf8' },
                  { label: 'Keywords', value: analysisResult.keywords, color: '#4ade80' },
                  { label: 'Formatting', value: analysisResult.formatting, color: '#f59e0b' },
                ].map((s, i) => (
                  <AnimatedCard key={s.label} delay={i * 80} style={{ textAlign: 'center', padding: '20px 14px' }}>
                    <ScoreRing score={s.value} color={s.color} />
                    <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>{s.label}</div>
                  </AnimatedCard>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Skill breakdown */}
                <AnimatedCard delay={300}>
                  <h3 style={{ fontWeight: 700, marginBottom: 18, color: '#6366f1' }}>Skill Breakdown</h3>
                  <ProgressBar label="Technical Skills" value={92} color="#6366f1" delay={0} />
                  <ProgressBar label="Soft Skills" value={68} color="#a78bfa" delay={100} />
                  <ProgressBar label="Experience Depth" value={85} color="#38bdf8" delay={200} />
                  <ProgressBar label="Education" value={75} color="#4ade80" delay={300} />
                </AnimatedCard>

                {/* Keywords */}
                <AnimatedCard delay={400}>
                  <h3 style={{ fontWeight: 700, marginBottom: 14, color: '#4ade80' }}>✅ Top Keywords Found</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {analysisResult.topKeywords.map(k => <Badge key={k} color="green">{k}</Badge>)}
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: 14, color: '#f87171' }}>⚠️ Missing Keywords</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {analysisResult.missingKeywords.map(k => <Badge key={k} color="red">{k}</Badge>)}
                  </div>
                </AnimatedCard>
              </div>

              {/* Suggestions */}
              <AnimatedCard delay={500}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#f59e0b' }}>💡 AI Suggestions to Improve</h3>
                {analysisResult.suggestions.map((s, i) => (
                  <div key={i} className="fade-up" style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(99,102,241,.06)', marginBottom: 10,
                    border: '1px solid rgba(99,102,241,.12)',
                    animationDelay: `${600 + i * 80}ms`,
                  }}>
                    <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 14 }}>{i + 1}</span>
                    <span style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
                <button onClick={runAnalysis} className="btn-ghost" style={{ marginTop: 12, padding: '10px 20px', borderRadius: 12, fontSize: 13 }}>
                  🔄 Re-analyze
                </button>
              </AnimatedCard>
            </div>
          )}
        </section>
      )}

      {/* ── INTERVIEW SCHEDULER ── */}
      {page === 'interviews' && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>📅 Interview Scheduler</h2>
          <p className="fade-up" style={{ color: '#64748b', marginBottom: 28 }}>Track every interview in one place. Never miss a callback.</p>

          {/* Add Interview */}
          <AnimatedCard style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#a78bfa' }}>Schedule New Interview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 14 }}>
              <input value={newInterview.company} onChange={e => setNewInterview({ ...newInterview, company: e.target.value })} placeholder="Company" className="input-field" style={{ fontSize: 13 }} />
              <input value={newInterview.role} onChange={e => setNewInterview({ ...newInterview, role: e.target.value })} placeholder="Role" className="input-field" style={{ fontSize: 13 }} />
              <input type="date" value={newInterview.date} onChange={e => setNewInterview({ ...newInterview, date: e.target.value })} className="input-field" style={{ fontSize: 13, colorScheme: 'dark' }} />
              <input type="time" value={newInterview.time} onChange={e => setNewInterview({ ...newInterview, time: e.target.value })} className="input-field" style={{ fontSize: 13, colorScheme: 'dark' }} />
              <select value={newInterview.type} onChange={e => setNewInterview({ ...newInterview, type: e.target.value })} className="input-field" style={{ fontSize: 13 }}>
                <option>Video</option>
                <option>Phone</option>
                <option>Onsite</option>
              </select>
            </div>
            <button onClick={addInterview} className="btn-primary" style={{ padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
              + Schedule Interview
            </button>
          </AnimatedCard>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['All', 'Confirmed', 'Pending'].map(f => (
              <button
                key={f}
                onClick={() => setInterviewFilter(f)}
                className={interviewFilter === f ? 'btn-primary' : 'btn-ghost'}
                style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13 }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {interviews
              .filter(i => interviewFilter === 'All' || i.status === interviewFilter)
              .map((iv, idx) => {
                const typeColor = { Video: 'blue', Phone: 'amber', Onsite: 'purple' }[iv.type] || 'slate';
                const statusColor = iv.status === 'Confirmed' ? 'green' : 'amber';
                return (
                  <AnimatedCard key={iv.id} delay={idx * 70} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, flexShrink: 0,
                    }}>
                      {iv.type === 'Video' ? '🎥' : iv.type === 'Phone' ? '📞' : '🏢'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{iv.company}</div>
                      <div style={{ color: '#64748b', fontSize: 13, marginBottom: 8 }}>{iv.role}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <Badge color={typeColor}>{iv.type}</Badge>
                        <Badge color={statusColor}>{iv.status}</Badge>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>{iv.date}</div>
                      <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{iv.time}</div>
                    </div>
                    <button
                      onClick={() => {
                        setInterviews(prev => prev.filter(x => x.id !== iv.id));
                        pushToast('🗑️', 'Interview removed', `${iv.company} removed from schedule`);
                      }}
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18, transition: 'color .15s' }}
                      onMouseOver={e => e.target.style.color = '#ef4444'}
                      onMouseOut={e => e.target.style.color = '#475569'}
                    >
                      ×
                    </button>
                  </AnimatedCard>
                );
              })}
            {interviews.filter(i => interviewFilter === 'All' || i.status === interviewFilter).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>No {interviewFilter.toLowerCase()} interviews</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── DASHBOARD ── */}
      {page === 'dashboard' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>📊 Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Applications', value: applied.length, icon: '📨', color: '#6366f1', page: 'tracker' },
              { label: 'Saved Jobs', value: saved.length, icon: '🔖', color: '#38bdf8', page: 'jobs' },
              { label: 'Interviews', value: interviews.length, icon: '📅', color: '#4ade80', page: 'interviews' },
              { label: 'Plan', value: plan.split(' ')[0], icon: '💳', color: '#f59e0b', page: 'pricing' },
            ].map((s, i) => (
              <AnimatedCard key={s.label} delay={i * 80} style={{ textAlign: 'center', padding: 28, cursor: s.page ? 'pointer' : 'default' }} onClick={() => s.page && setPage(s.page)}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>{s.label}</div>
              </AnimatedCard>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <AnimatedCard delay={320}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#6366f1' }}>Application Activity</h3>
              <ProgressBar label="Applied" value={Math.min(applied.length * 25, 100)} color="#6366f1" />
              <ProgressBar label="Interviews Scheduled" value={interviews.length * 33} color="#4ade80" delay={100} />
              <ProgressBar label="Profile Completeness" value={uploadName ? 85 : 40} color="#f59e0b" delay={200} />
            </AnimatedCard>
            <AnimatedCard delay={400}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#4ade80' }}>Upcoming Interviews</h3>
              {interviews.slice(0, 3).map((iv, i) => (
                <div key={iv.id} className="fade-up" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 10, background: '#030f1e', marginBottom: 8,
                  animationDelay: `${500 + i * 80}ms`,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{iv.company}</div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>{iv.role}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#e2e8f0' }}>{iv.date}</div>
                    <Badge color={iv.status === 'Confirmed' ? 'green' : 'amber'}>{iv.status}</Badge>
                  </div>
                </div>
              ))}
              {interviews.length === 0 && <p style={{ color: '#475569', fontSize: 13 }}>No interviews yet. Schedule one!</p>}
            </AnimatedCard>
          </div>
        </section>
      )}

      {/* ── APPLICATION TRACKER ── */}
      {page === 'tracker' && (() => {
        const appliedJobs = JOBS.filter(j => applied.includes(j.id));
        const colCounts   = KANBAN_COLS.map(c => ({ ...c, count: appliedJobs.filter(j => getStage(j.id) === c.id).length }));

        return (
          <section style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>🗂️ Application Tracker</h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>
                  {appliedJobs.length === 0
                    ? 'Apply to jobs to track them here across hiring stages.'
                    : `Tracking ${appliedJobs.length} application${appliedJobs.length !== 1 ? 's' : ''} — drag cards between stages or use the dropdown.`}
                </p>
              </div>
              {/* Summary pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {colCounts.map(c => (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: c.bg, border: `1px solid ${c.color}33`,
                    borderRadius: 20, padding: '5px 14px', fontSize: 12,
                  }}>
                    <span>{c.emoji}</span>
                    <span style={{ color: c.color, fontWeight: 600 }}>{c.count}</span>
                    <span style={{ color: '#64748b' }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state */}
            {appliedJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 24px', color: '#334155' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#475569', marginBottom: 8 }}>No applications yet</div>
                <div style={{ fontSize: 14, color: '#334155', marginBottom: 24 }}>Go to the Jobs page, apply to some roles, and they'll appear here automatically.</div>
                <button
                  onClick={() => setPage('jobs')}
                  className="btn-primary"
                  style={{ borderRadius: 12, padding: '10px 28px', fontSize: 14 }}
                >
                  Browse Jobs →
                </button>
              </div>
            )}

            {/* Kanban Board */}
            {appliedJobs.length > 0 && (
              <div
                className="kanban-board"
                onDragOver={e => e.preventDefault()}
              >
                {KANBAN_COLS.map(col => {
                  const colJobs = appliedJobs.filter(j => getStage(j.id) === col.id);
                  const isOver  = dragOverCol === col.id;
                  return (
                    <div
                      key={col.id}
                      className={`kanban-col${isOver ? ' drag-over' : ''}`}
                      style={{ borderTopColor: col.color, borderTopWidth: 2, borderTopStyle: 'solid' }}
                      onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null); }}
                      onDrop={e => {
                        e.preventDefault();
                        if (draggedCard !== null) moveCard(draggedCard, col.id);
                        setDraggedCard(null);
                        setDragOverCol(null);
                      }}
                    >
                      {/* Column header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${col.color}22` }}>
                        <span style={{ fontSize: 16 }}>{col.emoji}</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: col.color }}>{col.label}</span>
                        <span style={{
                          marginLeft: 'auto', background: col.bg,
                          border: `1px solid ${col.color}44`, borderRadius: 12,
                          padding: '1px 9px', fontSize: 11, color: col.color, fontWeight: 600,
                        }}>{colJobs.length}</span>
                      </div>

                      {/* Drop zone hint */}
                      {colJobs.length === 0 && (
                        <div style={{
                          border: `1.5px dashed ${isOver ? col.color : '#1e293b'}`,
                          borderRadius: 10, padding: '24px 12px',
                          textAlign: 'center', fontSize: 12,
                          color: isOver ? col.color : '#334155',
                          transition: 'all 0.2s',
                        }}>
                          {isOver ? '⬇ Drop here' : 'Drop cards here'}
                        </div>
                      )}

                      {/* Cards */}
                      {colJobs.map(job => (
                        <div
                          key={job.id}
                          className={`kanban-card card-drop${draggedCard === job.id ? ' dragging' : ''}`}
                          draggable
                          onDragStart={() => setDraggedCard(job.id)}
                          onDragEnd={() => { setDraggedCard(null); setDragOverCol(null); }}
                        >
                          {/* Title & remove */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 2 }}>{job.title}</div>
                              <div style={{ fontSize: 11.5, color: '#64748b' }}>{job.company}</div>
                            </div>
                            <button
                              onClick={() => removeFromTracker(job.id)}
                              title="Remove from tracker"
                              style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0, padding: '2px 4px', borderRadius: 4, transition: 'color .15s' }}
                              onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                              onMouseOut={e => e.currentTarget.style.color = '#334155'}
                            >✕</button>
                          </div>

                          {/* Location + salary */}
                          <div style={{ fontSize: 11, color: '#475569', marginBottom: 8 }}>
                            📍 {job.state}, {job.country} &nbsp;·&nbsp; <span style={{ color: '#4ade80' }}>{job.salary}</span>
                          </div>

                          {/* Tags */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                            <Badge color="blue">{job.sector}</Badge>
                            {job.visa && <Badge color="green">✈️ Visa</Badge>}
                          </div>

                          {/* Stage mover dropdown */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <span style={{ fontSize: 10, color: '#334155', letterSpacing: '.05em' }}>MOVE TO</span>
                            <select
                              className="stage-select"
                              value={col.id}
                              onChange={e => moveCard(job.id, e.target.value)}
                              onClick={e => e.stopPropagation()}
                            >
                              {KANBAN_COLS.map(c => (
                                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tip */}
            {appliedJobs.length > 0 && (
              <p style={{ textAlign: 'center', fontSize: 12, color: '#1e293b', marginTop: 24 }}>
                💡 Drag cards between columns or use the dropdown to advance stages. Progress is saved automatically.
              </p>
            )}
          </section>
        );
      })()}

      {/* ── PROFILE ── */}
      {page === 'profile' && (
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>👤 Career Profile</h2>
          <div style={{ display: 'grid', gap: 18 }}>
            <AnimatedCard>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) { setResume(f.name); setUploadName(f.name); } }}
                style={{
                  border: `2px dashed ${dragging ? '#6366f1' : '#1e293b'}`,
                  borderRadius: 18, padding: '48px 24px', textAlign: 'center',
                  transition: 'border-color .2s, background .2s',
                  background: dragging ? 'rgba(99,102,241,.05)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Upload Resume</h3>
                <p style={{ color: '#64748b', marginBottom: 18, fontSize: 14 }}>PDF, DOCX, or TXT — drag & drop or browse</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setResume(f.name); setUploadName(f.name); setPreviewUrl(URL.createObjectURL(f)); pushToast('📄', 'Resume uploaded', f.name); }
                  }}
                  style={{ display: 'block', margin: '0 auto 12px', maxWidth: 300 }}
                />
                {uploadName && <Badge color="green">✓ {uploadName}</Badge>}
              </div>
            </AnimatedCard>
            
            {uploadName && (
              <AnimatedCard delay={200}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontWeight: 700 }}>Resume ready ✅</h3>
                    <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Run ATS analysis to get your score</p>
                  </div>
                  <button onClick={() => setPage('resume-score')} className="btn-primary" style={{ padding: '11px 22px', borderRadius: 12, fontSize: 13 }}>
                    Analyze →
                  </button>
                </div>
              </AnimatedCard>
            )}
          </div>
        </section>
      )}

      {/* ── PRICING ── */}
      {page === 'pricing' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>Choose Your Plan</h2>
          <p className="fade-up" style={{ color: '#64748b', textAlign: 'center', marginBottom: 40 }}>Upgrade to unlock AI matching, resume scoring, and more</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              { id: 'Free Plan', label: 'Free', price: '₹0', sub: 'For starters', color: '#4ade80', emoji: '🟢', features: ['10 Job Applies / Week', 'Basic AI Matching', 'Save 5 Jobs', 'Dashboard Access'], delay: 0 },
              { id: 'Pro Plan', label: 'Pro', price: '₹499/mo', sub: 'Most Popular', color: '#6366f1', emoji: '🔵', features: ['Unlimited Applies', 'Premium AI Matching', 'Resume Score Analyzer', 'ATS Resume Score', 'Interview Scheduler', 'Priority Alerts'], delay: 100, featured: true },
              { id: 'Recruiter Plan', label: 'Recruiter', price: '₹999/mo', sub: 'For companies', color: '#a78bfa', emoji: '🟣', features: ['Unlimited Job Posts', 'AI Shortlisting', 'Candidate Search', 'Analytics Dashboard', 'Company Branding Page'], delay: 200 },
            ].map(p => (
              <div key={p.id} className="fade-up card-hover" style={{
                ...card,
                border: plan === p.id ? `2px solid ${p.color}` : p.featured ? '1.5px solid #334155' : '1.5px solid #1e293b',
                position: 'relative', overflow: 'hidden',
                animationDelay: `${p.delay}ms`,
                transform: p.featured ? 'scale(1.03)' : 'scale(1)',
              }}>
                {p.featured && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'linear-gradient(135deg,#6366f1,#a78bfa)',
                    color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                  }}>POPULAR</div>
                )}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{p.emoji}</div>
                <h3 style={{ fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{p.label}</h3>
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>{p.sub}</p>
                <div style={{ fontSize: 28, fontWeight: 800, color: p.color, marginBottom: 20 }}>{p.price}</div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, fontSize: 13, color: '#94a3b8' }}>
                      <span style={{ color: p.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setPlan(p.id); if (p.id !== 'Free Plan') setPage('payment'); }}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, background: plan === p.id ? `linear-gradient(135deg,${p.color},${p.color}aa)` : undefined }}
                >
                  {plan === p.id ? '✓ Active Plan' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── PAYMENT ── */}
      {page === 'payment' && (
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>💳 Secure Checkout</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <AnimatedCard>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Payment Details</h3>
              <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>Selected: <span style={{ color: '#6366f1', fontWeight: 600 }}>{plan}</span></p>
              <input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Coupon Code" className="input-field" style={{ marginBottom: 12 }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer', fontSize: 14, color: '#94a3b8' }}>
                <input type="checkbox" checked={autoRenew} onChange={() => setAutoRenew(!autoRenew)} /> Auto Renewal
              </label>
              <button
                onClick={() => { setPaid(true); pushToast('🎉', 'Payment successful!', `${plan} is now active`); }}
                className="btn-primary"
                style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 15, fontWeight: 700 }}
              >
                {paid ? '✅ Payment Successful' : '🔐 Pay Now'}
              </button>
            </AnimatedCard>
            <AnimatedCard delay={120}>
              <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Payment History</h3>
              <input value={paymentSearch} onChange={e => setPaymentSearch(e.target.value)} placeholder="Search payments…" className="input-field" style={{ marginBottom: 14, fontSize: 13 }} />
              {billing.filter(b => `${b.item} ${b.date}`.toLowerCase().includes(paymentSearch.toLowerCase())).map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: '#030f1e', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>{b.item} • {b.date}</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>{b.amount}</span>
                </div>
              ))}
            </AnimatedCard>
          </div>
        </section>
      )}

      {/* ── ADD-ONS ── */}
      {page === 'addons' && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>⚡ Add-ons</h2>
          {plan === 'Free Plan' ? (
            <AnimatedCard style={{ textAlign: 'center', padding: 60, border: '1.5px solid #7f1d1d' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h3 style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Add-ons Locked</h3>
              <p style={{ color: '#64748b', marginBottom: 24 }}>Upgrade to Pro or Recruiter to unlock premium add-ons</p>
              <button onClick={() => setPage('pricing')} className="btn-primary" style={{ padding: '12px 28px', borderRadius: 14 }}>Upgrade Now →</button>
            </AnimatedCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
              {['Priority Apply', 'AI Resume Boost', 'Featured Profile', 'Recruiter Connect'].map((a, i) => (
                <AnimatedCard key={a} delay={i * 80}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>
                    {['🚀', '🤖', '⭐', '🤝'][i]}
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{a}</h3>
                  <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Boost your visibility and chances</p>
                  <button
                    onClick={() => { setAddons(addons.includes(a) ? addons : [...addons, a]); pushToast('⚡', 'Add-on activated', a); }}
                    className={addons.includes(a) ? 'btn-ghost' : 'btn-primary'}
                    style={{ width: '100%', padding: '10px 0', borderRadius: 12, fontSize: 13 }}
                  >
                    {addons.includes(a) ? '✓ Added' : 'Add On'}
                  </button>
                </AnimatedCard>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── NETWORK ── */}
      {page === 'network' && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>🌐 Network</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {['Google HR', 'Amazon Recruiter', 'Startup Founder', 'Hiring Manager'].map((n, i) => (
              <AnimatedCard key={n} delay={i * 80} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {['G', 'A', 'S', 'H'][i]}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>{n}</h3>
                <button
                  onClick={() => { setFollowing(following.includes(n) ? following.filter(x => x !== n) : [...following, n]); pushToast('🌐', following.includes(n) ? 'Unfollowed' : 'Following', n); }}
                  className={following.includes(n) ? 'btn-ghost' : 'btn-primary'}
                  style={{ width: '100%', padding: '10px 0', borderRadius: 12, fontSize: 13 }}
                >
                  {following.includes(n) ? '✓ Following' : '+ Follow'}
                </button>
              </AnimatedCard>
            ))}
          </div>
        </section>
      )}

      {/* ── RECRUITER ── */}
      {page === 'recruiter' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>🏢 Recruiter Portal</h2>
          {plan !== 'Recruiter Plan' ? (
            <AnimatedCard style={{ textAlign: 'center', padding: 60, border: '1.5px solid #4a1b8c' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h3 style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Recruiter Portal Locked</h3>
              <p style={{ color: '#64748b', marginBottom: 24 }}>Upgrade to Recruiter Plan to access hiring tools</p>
              <button onClick={() => setPage('pricing')} className="btn-primary" style={{ padding: '12px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>Upgrade to Recruiter →</button>
            </AnimatedCard>
          ) : (
            <div style={{ display: 'grid', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[{ v: postedJobs.length, l: 'Active Jobs', c: '#6366f1' }, { v: 20, l: 'Applicants', c: '#38bdf8' }, { v: 3, l: 'AI Shortlisted', c: '#4ade80' }, { v: '1.2K', l: 'Brand Views', c: '#f59e0b' }].map((s, i) => (
                  <AnimatedCard key={s.l} delay={i * 70} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.v}</div>
                    <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{s.l}</div>
                  </AnimatedCard>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <AnimatedCard delay={280}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Post New Job</h3>
                  <input placeholder="Job Title" className="input-field" style={{ marginBottom: 10 }} />
                  <input placeholder="Location" className="input-field" style={{ marginBottom: 14 }} />
                  <button
                    onClick={() => { setPostedJobs(prev => [...prev, { id: Date.now(), title: 'New Position', apps: 0 }]); pushToast('🏢', 'Job posted!', 'Your listing is now live'); }}
                    className="btn-primary" style={{ width: '100%', padding: '12px 0', borderRadius: 12 }}
                  >Post Job</button>
                </AnimatedCard>
                <AnimatedCard delay={360}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#4ade80' }}>AI Shortlisted Candidates</h3>
                  {candidates.map((c, i) => (
                    <div key={c.name} className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: '#030f1e', marginBottom: 8, animationDelay: `${400 + i * 80}ms` }}>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                      <Badge color={c.score >= 90 ? 'green' : 'blue'}>{c.score}%</Badge>
                    </div>
                  ))}
                </AnimatedCard>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── ADMIN ── */}
      {page === 'admin' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 28 }}>🛡 Admin Panel</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[{ v: users.toLocaleString(), l: 'Users', c: '#6366f1' }, { v: revenue, l: 'Revenue', c: '#4ade80' }, { v: postedJobs.length, l: 'Recruiters', c: '#38bdf8' }, { v: 2, l: 'Fraud Alerts', c: '#ef4444' }].map((s, i) => (
              <AnimatedCard key={s.l} delay={i * 70} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{s.l}</div>
              </AnimatedCard>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <AnimatedCard delay={280}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Pending Recruiter Approvals</h3>
              {pendingRecruiters.map((r, i) => (
                <div key={r} className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: '#030f1e', marginBottom: 8, animationDelay: `${300 + i * 80}ms` }}>
                  <span style={{ fontSize: 14 }}>{r}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: '#14532d', border: 'none', color: '#4ade80', padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                    <button style={{ background: '#450a0a', border: 'none', color: '#f87171', padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                  </div>
                </div>
              ))}
            </AnimatedCard>
            <AnimatedCard delay={360}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Platform Controls</h3>
              {[{ label: 'Manage Plans', color: '#6366f1', action: () => setPage('pricing') }, { label: 'View Payments', color: '#a78bfa', action: () => setPage('payment') }, { label: 'Ban Fraud Accounts', color: '#ef4444', action: () => pushToast('🛡', 'Action logged', '2 accounts flagged for review') }].map((btn, i) => (
                <button key={btn.label} onClick={btn.action} className="fade-up" style={{
                  width: '100%', padding: '12px 0', borderRadius: 12, marginBottom: 10,
                  background: `${btn.color}22`, border: `1.5px solid ${btn.color}44`,
                  color: btn.color, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  transition: 'background .15s',
                  animationDelay: `${400 + i * 80}ms`,
                }}>{btn.label}</button>
              ))}
            </AnimatedCard>
          </div>
        </section>
      )}

      {/* ── AI CHAT ASSISTANT ── */}
      <AIChatAssistant />

      {/* ── LOGIN MODAL ── */}
      {showLogin && (
        <div
          className="fade-up"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowLogin(false); }}
        >
          <div className="pop-in" style={{ ...card, width: '100%', maxWidth: 400, boxShadow: '0 32px 80px rgba(0,0,0,.6)' }}>
            <h2 style={{ fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Welcome back</h2>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Sign in to your GlobalPort account</p>
            <input placeholder="Email address" className="input-field" style={{ marginBottom: 12 }} />
            <input placeholder="Password" type="password" className="input-field" style={{ marginBottom: 20 }} />
            <button
              onClick={() => { setUser({ name: 'User' }); setShowLogin(false); pushToast('👋', 'Welcome back!', 'You are now signed in'); }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 15, fontWeight: 700, marginBottom: 12 }}
            >
              Continue →
            </button>
            <button onClick={() => setShowLogin(false)} className="btn-ghost" style={{ width: '100%', padding: '12px 0', borderRadius: 14, fontSize: 14 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
