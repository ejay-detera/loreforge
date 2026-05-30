import { useRef, useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { useScrollReveal, revealStyle } from '@/hooks/UseScrollReveal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faRocket, faEye } from '@fortawesome/free-solid-svg-icons';
// ─── Constants ────────────────────────────────────────────────────────────────
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];
const RUNE_COLORS = ['#f5c842', '#10b981', '#a78bfa'];

// ─── Hero Rune Canvas ─────────────────────────────────────────────────────────
function HeroRuneCanvas({ containerRef }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  const spawn = (x, y) => {
    const color = RUNE_COLORS[Math.floor(Math.random() * RUNE_COLORS.length)];
    particles.current.push({
      x: x ?? Math.random() * (containerRef.current?.offsetWidth ?? 800),
      y: y ?? (containerRef.current?.offsetHeight ?? 160) * (0.3 + Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 0.5, vy: -(0.4 + Math.random() * 0.8),
      life: 1, decay: 0.007 + Math.random() * 0.007,
      size: 10 + Math.random() * 9, rot: Math.random() * 360,
      rotS: (Math.random() - 0.5) * 2,
      rune: RUNES[Math.floor(Math.random() * RUNES.length)], color,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => { canvas.width = container.offsetWidth; canvas.height = container.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay; p.rot += p.rotS;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = p.life * 0.55;
        ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 7;
        ctx.font = `700 ${p.size}px Poppins, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.rune, 0, 0);
        ctx.restore();
      });
    };
    draw();

    const ambientInterval = setInterval(() => spawn(), 420);
    const onMouseMove = (e) => {
      if (Math.random() > 0.4) return;
      const r = container.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top);
    };
    container.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(ambientInterval);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
}

// ─── Rune Particles (hover) ───────────────────────────────────────────────────
function RuneParticles({ active, color }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const spawn = () => Array.from({ length: 5 }, (_, i) => ({
      id: i + Date.now(), rune: RUNES[Math.floor(Math.random() * RUNES.length)],
      x: 5 + Math.random() * 88, y: 65 + Math.random() * 25,
      vx: (Math.random() - 0.5) * 1.1, vy: -(0.7 + Math.random() * 1.2),
      life: 1, size: 10 + Math.random() * 8,
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 3.5,
    }));
    setParticles(spawn());
    const interval = setInterval(() => setParticles(spawn()), 600);
    return () => clearInterval(interval);
  }, [active]);
  useEffect(() => {
    if (!active || particles.length === 0) return;
    let frame;
    const animate = () => {
      setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.02, rotation: p.rotation + p.rotSpeed })).filter(p => p.life > 0));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, particles.length]);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {particles.map(p => (
        <div key={p.id} className="absolute select-none font-bold" style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, color, opacity: p.life * 0.7, transform: `rotate(${p.rotation}deg)`, textShadow: `0 0 8px ${color}` }}>
          {p.rune}
        </div>
      ))}
    </div>
  );
}

// ─── Shared Corner Brackets ───────────────────────────────────────────────────
function CornerBrackets({ color = '#f5c842', opacity = 0.45 }) {
  return (
    <>
      {[
        { cls: 'top-2.5 left-2.5', d: 'M0 12 L0 0 L12 0' },
        { cls: 'top-2.5 right-2.5', t: 'scaleX(-1)', d: 'M0 12 L0 0 L12 0' },
        { cls: 'bottom-2.5 left-2.5', t: 'scaleY(-1)', d: 'M0 12 L0 0 L12 0' },
        { cls: 'bottom-2.5 right-2.5', t: 'scale(-1)', d: 'M0 12 L0 0 L12 0' },
      ].map(({ cls, t, d }, i) => (
        <div key={i} className={`absolute ${cls}`} style={{ width: 18, height: 18, transform: t, opacity }}>
          <svg viewBox="0 0 12 12" width="18" height="18">
            <path d={d} stroke={color} strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      ))}
    </>
  );
}

// ─── Genre Pill ───────────────────────────────────────────────────────────────
const GENRE_STYLES = {
  Fantasy: { bg: 'rgba(201,168,76,.12)', color: '#C9A84C', border: 'rgba(201,168,76,.25)', icon: 'fas fa-hat-wizard' },
  'Sci-Fi': { bg: 'rgba(0,191,255,.10)', color: '#00BFFF', border: 'rgba(0,191,255,.22)', icon: 'fas fa-rocket' },
  Horror: { bg: 'rgba(139,0,0,.15)', color: '#e05555', border: 'rgba(220,50,50,.25)', icon: 'fas fa-ghost' },
};

function GenrePill({ genre }) {
  const s = GENRE_STYLES[genre] ?? GENRE_STYLES.Fantasy;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <i className={`${s.icon} text-xs`} /> {genre}
    </span>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#a78bfa', opacity: 0.7, letterSpacing: '0.38em' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(167,139,250,.22), transparent)' }} />
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, accent, glow, dim, gradFrom, gradTo, rune, delay }) {
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div ref={ref} style={revealStyle(visible, delay, 'up', 24)}>
      <div
        className="relative overflow-hidden rounded-2xl p-6 cursor-default"
        style={{
          background: 'linear-gradient(145deg, rgba(12,16,30,.92), rgba(18,22,40,.95))',
          border: `1.5px solid ${hovered ? accent : dim}`,
          boxShadow: hovered ? `0 0 24px ${glow}, 0 12px 40px rgba(0,0,0,.5)` : '0 4px 16px rgba(0,0,0,.4)',
          transition: 'border-color .35s, box-shadow .35s, transform .35s',
          transform: hovered ? 'translateY(-4px)' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: hovered ? 0.6 : 0, transition: 'opacity .35s' }} />

        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-base text-white" style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}>
          <i className={icon} />
        </div>
        <div className="text-4xl font-extrabold mb-1" style={{ color: '#f0ead6', lineHeight: 1 }}>{value}</div>
        <div className="text-xs" style={{ color: '#6b7a99', letterSpacing: '0.04em' }}>{label}</div>

        {/* Background rune deco */}
        <div className="absolute bottom-2.5 right-3.5 font-bold select-none" style={{ fontSize: 20, color: accent, opacity: 0.08 }}>{rune}</div>
      </div>
    </div>
  );
}

// ─── Adventures Table Row ─────────────────────────────────────────────────────
function AdventureRow({ character, genre, turns, maxTurns, outcome, isMobile }) {
  const pct = Math.round((turns / maxTurns) * 100);
  const OUTCOME_COLORS = { Victory: '#10b981', Defeat: '#e05555', Abandoned: '#8899aa', Active: '#3b82f6' };
  const OUTCOME_ICONS = { Victory: 'fas fa-trophy', Defeat: 'fas fa-skull', Abandoned: 'fas fa-clock', Active: 'fas fa-running' };
  const CHAR_COLORS = { Fantasy: '#f5c842', 'Sci-Fi': '#00BFFF', Horror: '#e05555' };
  const trackColor = { Fantasy: 'linear-gradient(90deg,#f5c842,#d4920d)', 'Sci-Fi': 'linear-gradient(90deg,#3b9eff,#00BFFF)', Horror: 'linear-gradient(90deg,#e05555,#8B0000)' };
  const [hovered, setHovered] = useState(false);

  if (isMobile) {
    return (
      <div
        className="p-4 flex flex-col gap-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,.04)', background: hovered ? 'rgba(255,255,255,.025)' : 'transparent', transition: 'background .2s' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium flex items-center gap-2" style={{ color: '#e8e6f0' }}>
            <i className="fas fa-user text-xs" style={{ color: CHAR_COLORS[genre] ?? '#8899aa' }} />
            {character}
          </div>
          <GenrePill genre={genre} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: trackColor[genre] ?? 'linear-gradient(90deg,#10b981,#3b9eff)' }} />
            </div>
            <span style={{ color: '#6b7a99' }}>{turns}/{maxTurns}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium" style={{ color: OUTCOME_COLORS[outcome] }}>
            <i className={`${OUTCOME_ICONS[outcome]} text-xs`} />
            {outcome}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid gap-0"
      style={{ gridTemplateColumns: '1fr 1fr 110px 1fr', borderBottom: '1px solid rgba(255,255,255,.04)', background: hovered ? 'rgba(255,255,255,.025)' : 'transparent', transition: 'background .2s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="px-5 py-3.5 text-sm font-medium flex items-center gap-2" style={{ color: '#e8e6f0' }}>
        <i className="fas fa-user text-xs" style={{ color: CHAR_COLORS[genre] ?? '#8899aa' }} />
        {character}
      </div>
      <div className="px-5 py-3.5 flex items-center"><GenrePill genre={genre} /></div>
      <div className="px-5 py-3.5 flex items-center gap-2">
        <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: trackColor[genre] ?? 'linear-gradient(90deg,#f5c842,#d4920d)' }} />
        </div>
        <span className="text-xs" style={{ color: '#6b7a99' }}>{turns}/{maxTurns}</span>
      </div>
      <div className="px-5 py-3.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: OUTCOME_COLORS[outcome] }}>
        <i className={`${OUTCOME_ICONS[outcome]} text-xs`} />
        {outcome}
      </div>
    </div>
  );
}

// ─── Spotlight Card ───────────────────────────────────────────────────────────
function SpotlightCard({ icon, name, author, genre, turns, outcome, accentColor, preview, delay }) {
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useScrollReveal(0.1);
  const s = GENRE_STYLES[genre] ?? GENRE_STYLES.Fantasy;

  return (
    <div ref={ref} style={revealStyle(visible, delay, 'up', 28)}>
      <div
        className="relative overflow-hidden rounded-2xl p-6 cursor-default"
        style={{
          background: 'linear-gradient(145deg, rgba(12,16,30,.92), rgba(18,22,40,.95))',
          border: `1.5px solid ${hovered ? 'rgba(167,139,250,.4)' : 'rgba(255,255,255,.07)'}`,
          boxShadow: hovered ? '0 0 28px rgba(167,139,250,.15), 0 12px 40px rgba(0,0,0,.5)' : '0 4px 16px rgba(0,0,0,.4)',
          transform: hovered ? 'translateY(-4px)' : 'none',
          transition: 'border-color .35s, box-shadow .35s, transform .35s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <RuneParticles active={hovered} color={accentColor} />
        <CornerBrackets color={accentColor} opacity={hovered ? 0.5 : 0.15} />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${s.bg}`, border: `1px solid ${s.border}` }}>
                <i className={icon} style={{ color: accentColor }} />
              </div>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: '#e8e6f0', lineHeight: 1.3 }}>{name}</div>
                <div className="text-xs" style={{ color: '#6b7a99' }}>by <span style={{ color: '#a78bfa' }}>{author}</span></div>
              </div>
            </div>
          </div>

          {preview && (
            <div className="mb-5 text-[11px] leading-relaxed italic" style={{ color: '#8899aa', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              "{preview}"
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <GenrePill genre={genre} />
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,.1)', color: '#10b981', border: '1px solid rgba(16,185,129,.2)' }}>{turns} turns</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: outcome === 'Victory' ? 'rgba(245,200,66,.08)' : 'rgba(224,85,85,.08)', color: outcome === 'Victory' ? '#f5c842' : '#e05555', border: outcome === 'Victory' ? '1px solid rgba(245,200,66,.15)' : '1px solid rgba(224,85,85,.15)' }}>
                {outcome === 'Victory' ? '🏆' : '💀'} {outcome}
              </span>
            </div>
            <button
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.75)', border: '1.5px solid rgba(255,255,255,.13)', cursor: 'pointer', transition: 'all .2s', fontFamily: 'Poppins, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = `${accentColor}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.13)'; e.currentTarget.style.color = 'rgba(255,255,255,.75)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
            >
              <i className="fas fa-play text-xs" /> Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ auth, stats, recentSessions, spotlightCampaigns, lastSession }) {
  const heroRef = useRef(null);
  const { ref: statsRef, visible: statsVisible } = useScrollReveal(0.1);
  const { ref: tableRef, visible: tableVisible } = useScrollReveal(0.1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  const firstName = auth?.user?.username?.split(' ')[0] || 'Adventurer';

  const statCards = [
    { icon: 'fas fa-scroll', value: stats?.total ?? 0, label: 'Total Games Played', accent: '#10b981', glow: 'rgba(16,185,129,.25)', dim: 'rgba(16,185,129,.14)', gradFrom: '#10b981', gradTo: '#059669', rune: 'ᚷ' },
    { icon: 'fas fa-trophy', value: stats?.victories ?? 0, label: 'Victories', accent: '#f5c842', glow: 'rgba(245,200,66,.25)', dim: 'rgba(245,200,66,.14)', gradFrom: '#f5c842', gradTo: '#d4920d', rune: 'ᛏ' },
    { icon: 'fas fa-skull', value: stats?.defeats ?? 0, label: 'Defeats', accent: '#e05555', glow: 'rgba(224,85,85,.25)', dim: 'rgba(224,85,85,.14)', gradFrom: '#e05555', gradTo: '#8B0000', rune: 'ᚦ' },
    { icon: 'fas fa-hat-wizard', value: stats?.favGenre ?? 'None', label: 'Favourite Genre', accent: '#a78bfa', glow: 'rgba(167,139,250,.25)', dim: 'rgba(167,139,250,.14)', gradFrom: '#a78bfa', gradTo: '#7c3aed', rune: 'ᚠ' },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
          @keyframes gradShift { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
          @keyframes pulseGlow { 0%,100%{opacity:.4;} 50%{opacity:.9;} }
          @keyframes borderTrace { 0%{opacity:.2;} 50%{opacity:.7;} 100%{opacity:.2;} }
          @keyframes spin        { to { transform: rotate(360deg);  } }
          @keyframes spinReverse { to { transform: rotate(-360deg); } }
        `}</style>

        <div className="min-h-screen" style={{ background: '#080c18', fontFamily: 'Poppins, sans-serif' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* ══ SECTION 1: HERO BANNER ══ */}
            <div
              ref={heroRef}
              className="relative overflow-hidden rounded-2xl mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(12,16,30,.97) 0%, rgba(18,22,40,.97) 100%)',
                border: '1.5px solid rgba(245,200,66,.18)',
                padding: 'clamp(20px, 5vw, 40px)',
              }}
            >
              {/* Animated top border */}
              <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(245,200,66,.6),transparent)', animation: 'borderTrace 3s ease-in-out infinite' }} />

              {/* Ambient green glow */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 15% 50%, rgba(16,185,129,.07) 0%, transparent 70%)' }} />

              <CornerBrackets color="#f5c842" opacity={0.45} />
              <HeroRuneCanvas containerRef={heroRef} />

              <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
                <div>
                  <p className="mb-2.5 text-xs font-medium tracking-widest uppercase" style={{ color: '#10b981', opacity: 0.75, letterSpacing: '0.38em' }}>
                    ⚔ &nbsp;Welcome back, adventurer
                  </p>
                  <h1 className="mb-4 font-extrabold" style={{ fontSize: 'clamp(22px,3.5vw,34px)', color: '#f0ead6', lineHeight: 1.2 }}>
                    Hail,{' '}
                    <span style={{ background: 'linear-gradient(135deg,#f5c842 0%,#10b981 60%,#f5c842 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'gradShift 4s ease infinite', display: 'inline-block' }}>
                      {firstName}
                    </span>! <i className="fas fa-dragon" style={{ color: '#f5c842', fontSize: '0.7em', verticalAlign: 'middle' }}></i>
                  </h1>

                  {/* Last session pill */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: '#f5c842', animation: 'pulseGlow 2s ease-in-out infinite', flexShrink: 0 }} />
                    <span className="text-xs font-light" style={{ color: '#8899aa' }}>
                      Last adventure:{' '}
                      <span className="font-medium" style={{ color: '#e8e6f0' }}>{lastSession?.genre ?? 'No Last Adventure Yet'}</span>
                      {' · '}Turn {lastSession?.turn ?? 0}
                      {' · '}
                      <span style={{ color: (lastSession?.status ?? 'Abandoned') === 'Abandoned' ? '#e05555' : (lastSession?.status ?? 'Abandoned') === 'Victory' ? '#10b981' : '#8899aa' }}>{lastSession?.status ?? 'Abandoned'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {((!lastSession || ['victory', 'defeat', 'defeated', 'abandoned'].includes(lastSession?.status?.toLowerCase())) ? (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-full font-semibold text-xs"
                      style={{ padding: '10px 20px', background: 'rgba(255,255,255,.02)', color: 'rgba(255,255,255,.25)', border: '1.5px solid rgba(255,255,255,.08)', cursor: 'not-allowed', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.06em', opacity: 0.5 }}
                    >
                      <i className="fas fa-redo text-xs" /> Continue
                    </button>
                  ) : (
                    <Link
                      href={lastSession?.id ? route('game') : '#'}
                      className="inline-flex items-center gap-2 rounded-full font-semibold text-xs"
                      style={{ padding: '10px 20px', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.8)', border: '1.5px solid rgba(255,255,255,.15)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.06em', transition: 'all .25s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,200,66,.5)'; e.currentTarget.style.background = 'rgba(245,200,66,.07)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; e.currentTarget.style.background = 'rgba(245,200,66,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.8)'; }}
                    >
                      <i className="fas fa-redo text-xs" /> Continue
                    </Link>
                  ))}
                  {((!lastSession || ['victory', 'defeat', 'defeated', 'abandoned'].includes(lastSession?.status?.toLowerCase())) ? (
                    <Link
                      href={route('new-game')}
                      className="inline-flex items-center gap-2 rounded-full font-semibold text-xs text-white"
                      style={{ padding: '10px 22px', background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 18px rgba(16,185,129,.3)', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.06em', transition: 'transform .25s, box-shadow .25s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(16,185,129,.5)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 18px rgba(16,185,129,.3)'; }}
                    >
                      <i className="fas fa-plus text-xs" /> Start New Game
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-full font-semibold text-xs"
                      style={{ padding: '10px 22px', background: 'rgba(255,255,255,.02)', color: 'rgba(255,255,255,.25)', border: '1.5px solid rgba(255,255,255,.08)', cursor: 'not-allowed', fontFamily: 'Poppins, sans-serif', letterSpacing: '0.06em', opacity: 0.5 }}
                    >
                      <i className="fas fa-plus text-xs" /> Start New Game
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ SECTION 2: STAT CARDS ══ */}
            <div ref={statsRef}>
              <SectionLabel>Your Chronicle</SectionLabel>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.1} />)}
              </div>
            </div>

            <div className="h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,.07), transparent)' }} />

            {/* ══ SECTION 3: RECENT ADVENTURES ══ */}
            <div ref={tableRef} style={revealStyle(tableVisible, 0, 'up', 20)}>
              <div className="flex items-center justify-between mb-5">
                <SectionLabel>Recent Adventures</SectionLabel>
                <Link href={route('history')} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg" style={{ background: 'transparent', color: '#a78bfa', border: '1px solid rgba(167,139,250,.3)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,.1)'; e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.color = '#c4b5fd'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(167,139,250,.3)'; e.currentTarget.style.color = '#a78bfa'; }}>
                  <i className="fas fa-list text-xs" /> View All
                </Link>
              </div>

              <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1.5px solid rgba(255,255,255,.07)', background: 'rgba(12,16,30,.8)', backdropFilter: 'blur(8px)' }}>
                {/* Table header */}
                {!isMobile && (
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 110px 1fr', background: 'rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                    {['Character', 'Genre', 'Turns', 'Outcome'].map(h => (
                      <div key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#4a5568', letterSpacing: '0.3em' }}>{h}</div>
                    ))}
                  </div>
                )}
                {(recentSessions ?? []).map((s, i) => <AdventureRow key={i} {...s} isMobile={isMobile} />)}
              </div>
            </div>

            <div className="h-px mb-8" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,.07), transparent)' }} />

            {/* ══ SECTION 4: COMMUNITY SPOTLIGHT ══ */}
            <div className="flex items-center justify-between mb-5">
              <SectionLabel>Community Spotlight</SectionLabel>
              <Link href={route('community')} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg" style={{ background: 'transparent', color: '#a78bfa', border: '1px solid rgba(167,139,250,.3)', cursor: 'pointer', fontFamily: 'Poppins, sans-serif', transition: 'all .2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,.1)'; e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.color = '#c4b5fd'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(167,139,250,.3)'; e.currentTarget.style.color = '#a78bfa'; }}>
                <i className="fas fa-compass text-xs" /> Browse All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(spotlightCampaigns ?? []).map((s, i) => <SpotlightCard key={i} {...s} delay={i * 0.1} />)}
            </div>

          </div>
        </div>
      </>
    </AuthenticatedLayout>
  );
}