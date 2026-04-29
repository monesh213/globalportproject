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
  const [saved, setSaved] = useState([]);
  const [applied, setApplied] = useState([]);
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
  const [aiPrefs, setAiPrefs] = useState({ role: 'React Engineer', location: 'Remote', salary: '₹20L+' });

  const jobs = [
    { id: 1, title: 'Senior Java Developer', company: 'NovaTech', country: 'Germany', tags: ['Java', 'Spring', 'AWS'] },
    { id: 2, title: 'React Engineer', company: 'SkyLabs', country: 'Canada', tags: ['React', 'TypeScript'] },
    { id: 3, title: 'Cloud Architect', company: 'Orbit', country: 'UAE', tags: ['AWS', 'Terraform', 'Docker'] },
    { id: 4, title: 'Backend Engineer', company: 'PrimeSoft', country: 'UK', tags: ['Node.js', 'PostgreSQL'] },
  ];

  const filtered = useMemo(() =>
    jobs.filter(j =>
      `${j.title} ${j.company} ${j.country}`.toLowerCase().includes(query.toLowerCase())
    ), [query]);

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

  /* ── Fake AI job recs ── */
  const fetchAiRecs = () => {
    setAiLoading(true);
    setAiJobs([]);
    setTimeout(() => {
      setAiJobs([
        { id: 10, title: 'Senior React Developer', company: 'Stripe', country: 'Remote', match: 97, salary: '₹32L', tags: ['React', 'TypeScript', 'AWS'] },
        { id: 11, title: 'Frontend Engineer', company: 'Figma', country: 'Remote', match: 93, salary: '₹28L', tags: ['React', 'CSS', 'A11y'] },
        { id: 12, title: 'Full Stack Engineer', company: 'Razorpay', country: 'Bangalore', match: 89, salary: '₹22L', tags: ['React', 'Node.js', 'Redis'] },
        { id: 13, title: 'React Native Dev', company: 'PhonePe', country: 'Remote', match: 85, salary: '₹24L', tags: ['React Native', 'Redux'] },
        { id: 14, title: 'UI Engineer', company: 'Zerodha', country: 'Bangalore', match: 82, salary: '₹20L', tags: ['React', 'D3.js', 'WebGL'] },
      ]);
      setAiLoading(false);
      pushToast('🤖', 'AI Recommendations ready', '5 high-match jobs found for you');
    }, 1800);
  };

  /* ── Add interview ── */
  const addInterview = () => {
    if (!newInterview.company || !newInterview.date) return;
    setInterviews(prev => [...prev, { ...newInterview, id: Date.now(), status: 'Pending' }]);
    setNewInterview({ company: '', role: '', date: '', time: '', type: 'Video' });
    pushToast('📅', 'Interview scheduled', `${newInterview.company} on ${newInterview.date}`);
  };

  const nav = [
    { id: 'home', label: '🏠 Home' },
    { id: 'jobs', label: '💼 Jobs' },
    { id: 'ai-recs', label: '🤖 AI Match' },
    { id: 'dashboard', label: '📊 Dashboard' },
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
          {/* ── LOGO ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 16, flexShrink: 0, cursor: 'pointer' }} onClick={() => setPage('home')}>
            {/* Icon mark — two stacked pills forming a "G" portal */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer rounded square */}
              <rect width="32" height="32" rx="9" fill="#6366f1"/>
              {/* Top-left L-bracket shape = stylised G/port gate */}
              <rect x="7" y="7" width="4" height="14" rx="2" fill="white"/>
              <rect x="7" y="7" width="14" height="4" rx="2" fill="white"/>
              <rect x="7" y="17" width="10" height="4" rx="2" fill="white"/>
              {/* Inner accent dot — the destination pin */}
              <circle cx="23" cy="22" r="4.5" fill="#a78bfa"/>
              <circle cx="23" cy="22" r="2" fill="white"/>
              {/* Tiny connector from bracket to dot */}
              <line x1="17" y1="19" x2="20" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            </svg>
            {/* Wordmark */}
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

      {/* ── JOBS ── */}
      {page === 'jobs' && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Browse Jobs</h2>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, company, or location…"
            className="input-field fade-up"
            style={{ marginBottom: 28, fontSize: 15 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 18 }}>
            {filtered.map((j, i) => (
              <AnimatedCard key={j.id} delay={i * 80}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 17 }}>{j.title}</h3>
                  <Badge color="slate">{j.country}</Badge>
                </div>
                <p style={{ color: '#64748b', marginBottom: 14, fontSize: 14 }}>{j.company}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                  {j.tags.map(t => <Badge key={t} color="blue">{t}</Badge>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    onClick={() => setSaved(saved.includes(j.id) ? saved.filter(x => x !== j.id) : [...saved, j.id])}
                    className="btn-ghost"
                    style={{ padding: '10px 0', borderRadius: 12, fontSize: 13 }}
                  >
                    {saved.includes(j.id) ? '💾 Saved' : '🔖 Save'}
                  </button>
                  <button
                    onClick={() => {
                      setApplied(applied.includes(j.id) ? applied : [...applied, j.id]);
                      if (!applied.includes(j.id)) pushToast('✅', 'Applied!', `Application sent to ${j.company}`);
                    }}
                    className="btn-primary"
                    style={{ padding: '10px 0', borderRadius: 12, fontSize: 13 }}
                  >
                    {applied.includes(j.id) ? '✅ Applied' : 'Apply Now'}
                  </button>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </section>
      )}

      {/* ── AI RECOMMENDATIONS ── */}
      {page === 'ai-recs' && (
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
          <h2 className="fade-up" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🤖 AI Job Recommendations</h2>
          <p className="fade-up" style={{ color: '#64748b', marginBottom: 28 }}>Tell the AI what you want. It learns your preferences and surfaces the best matches.</p>

          <AnimatedCard delay={0} style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#a78bfa' }}>Your Preferences</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Role</label>
                <input
                  value={aiPrefs.role} onChange={e => setAiPrefs({ ...aiPrefs, role: e.target.value })}
                  className="input-field" style={{ fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Location</label>
                <input
                  value={aiPrefs.location} onChange={e => setAiPrefs({ ...aiPrefs, location: e.target.value })}
                  className="input-field" style={{ fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Expected Salary</label>
                <input
                  value={aiPrefs.salary} onChange={e => setAiPrefs({ ...aiPrefs, salary: e.target.value })}
                  className="input-field" style={{ fontSize: 13 }}
                />
              </div>
            </div>
            <button onClick={fetchAiRecs} className="btn-primary" style={{ padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
              {aiLoading ? '⏳ Matching…' : '🚀 Find My Best Matches'}
            </button>
          </AnimatedCard>

          {aiLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ ...card, height: 160 }}>
                  <div className="shimmer-bg" style={{ height: 20, width: '60%', marginBottom: 12 }} />
                  <div className="shimmer-bg" style={{ height: 14, width: '40%', marginBottom: 20 }} />
                  <div className="shimmer-bg" style={{ height: 10, width: '80%', marginBottom: 8 }} />
                  <div className="shimmer-bg" style={{ height: 10, width: '55%' }} />
                </div>
              ))}
            </div>
          )}

          {!aiLoading && aiJobs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
              {aiJobs.map((j, i) => (
                <AnimatedCard key={j.id} delay={i * 90} style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: j.match >= 95 ? 'linear-gradient(135deg,#4ade80,#22c55e)' :
                      j.match >= 90 ? 'linear-gradient(135deg,#6366f1,#a78bfa)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                    color: '#fff', fontSize: 11, fontWeight: 800,
                    padding: '6px 14px', borderRadius: '0 20px 0 14px',
                  }}>
                    {j.match}% match
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, paddingRight: 80 }}>{j.title}</h3>
                  <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>{j.company} • {j.country}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {j.tags.map(t => <Badge key={t} color="purple">{t}</Badge>)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>{j.salary}</span>
                    <Badge color="green">AI Pick</Badge>
                  </div>
                  <button
                    onClick={() => {
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
          )}

          {!aiLoading && aiJobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
              <p style={{ fontSize: 16 }}>Set your preferences above and hit "Find My Best Matches"</p>
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
              { label: 'Applications', value: applied.length, icon: '📨', color: '#6366f1' },
              { label: 'Saved Jobs', value: saved.length, icon: '🔖', color: '#38bdf8' },
              { label: 'Interviews', value: interviews.length, icon: '📅', color: '#4ade80' },
              { label: 'Plan', value: plan.split(' ')[0], icon: '💳', color: '#f59e0b' },
            ].map((s, i) => (
              <AnimatedCard key={s.label} delay={i * 80} style={{ textAlign: 'center', padding: 28 }}>
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
            <AnimatedCard delay={120}>
              <div style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
                <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Portfolio Link</h3>
                <input
                  value={portfolio} onChange={e => setPortfolio(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="input-field"
                  style={{ maxWidth: 420, margin: '12px auto 0', display: 'block' }}
                />
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
