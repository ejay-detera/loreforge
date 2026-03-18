import { useEffect, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';

// ─── Floating Rune Canvas ─────────────────────────────────────────────────────
const RUNES  = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');
const COLORS = ['#f5c842', '#f5c842', '#10b981', '#3b9eff'];

function RuneCanvas({ heroRef }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef   = useRef(null);

  const spawn = (x, y, fromMouse = false) => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.current.push({
      x: x ?? Math.random() * (heroRef.current?.offsetWidth ?? 800),
      y: y ?? (heroRef.current?.offsetHeight ?? 600) * (0.3 + Math.random() * 0.5),
      vx: (Math.random() - 0.5) * (fromMouse ? 1.5 : 0.6),
      vy: -(0.6 + Math.random() * 1.2),
      life: 1,
      decay: 0.006 + Math.random() * 0.006,
      size: 11 + Math.random() * 11,
      rune: RUNES[Math.floor(Math.random() * RUNES.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2.5,
      color,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero   = heroRef.current;
    if (!canvas || !hero) return;

    const resize = () => {
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.life -= p.decay;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = p.life * 0.65;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.font = `700 ${p.size}px Poppins, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.rune, 0, 0);
        ctx.restore();
      });
    };
    draw();

    // Ambient spawn
    const ambientInterval = setInterval(() => spawn(), 320);

    // Mouse trail
    const onMouseMove = (e) => {
      if (Math.random() > 0.35) return;
      const rect = hero.getBoundingClientRect();
      spawn(e.clientX - rect.left, e.clientY - rect.top, true);
    };
    hero.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(ambientInterval);
      hero.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 4 }}
    />
  );
}

// ─── Edge Rune Columns ────────────────────────────────────────────────────────
const RUNE_STR = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';

function EdgeRunes() {
  const runes = Array.from({ length: 9 }, (_, i) => ({
    char: RUNE_STR[Math.floor(Math.random() * RUNE_STR.length)],
    delay: i * 0.28,
    color: i % 3 === 0 ? '#10b981' : '#f5c842',
  }));

  return (
    <>
      {/* Left column */}
      <div className="absolute left-10 top-0 bottom-0 hidden lg:flex flex-col items-center justify-center gap-4 pointer-events-none" style={{ zIndex: 5 }}>
        {runes.map((r, i) => (
          <span key={i} style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13,
            color: r.color, opacity: 0.15,
            animation: `runeEdgePulse 3s ${r.delay}s ease-in-out infinite`,
          }}>
            {r.char}
          </span>
        ))}
      </div>
      {/* Right column */}
      <div className="absolute right-10 top-0 bottom-0 hidden lg:flex flex-col items-center justify-center gap-4 pointer-events-none" style={{ zIndex: 5 }}>
        {runes.map((r, i) => (
          <span key={i} style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13,
            color: r.color, opacity: 0.15,
            animation: `runeEdgePulse 3s ${r.delay + 0.15}s ease-in-out infinite`,
          }}>
            {RUNE_STR[Math.floor(Math.random() * RUNE_STR.length)]}
          </span>
        ))}
      </div>
    </>
  );
}

// ─── Arcane Frame ─────────────────────────────────────────────────────────────
function ArcaneFrame() {
  const lineStyle = (dir) => ({
    position: 'absolute',
    background: dir === 'h'
      ? 'linear-gradient(90deg, transparent, rgba(245,200,66,0.45), transparent)'
      : 'linear-gradient(180deg, transparent, rgba(245,200,66,0.45), transparent)',
    animation: 'borderPulse 3s ease-in-out infinite',
  });

  return (
    <div className="absolute pointer-events-none" style={{ inset: 20, zIndex: 3 }}>
      {/* Lines */}
      <div style={{ ...lineStyle('h'), top: 0, left: '10%', right: '10%', height: 1 }} />
      <div style={{ ...lineStyle('h'), bottom: 0, left: '10%', right: '10%', height: 1 }} />
      <div style={{ ...lineStyle('v'), left: 0, top: '10%', bottom: '10%', width: 1 }} />
      <div style={{ ...lineStyle('v'), right: 0, top: '10%', bottom: '10%', width: 1 }} />

      {/* Corner brackets */}
      {[
        { cls: 'top-0 left-0', t: 'none' },
        { cls: 'top-0 right-0', t: 'scaleX(-1)' },
        { cls: 'bottom-0 left-0', t: 'scaleY(-1)' },
        { cls: 'bottom-0 right-0', t: 'scale(-1)' },
      ].map(({ cls, t }, i) => (
        <div key={i} className={`absolute ${cls}`} style={{ width: 28, height: 28, transform: t }}>
          <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
            <path d="M0 20 L0 0 L20 0" stroke="#f5c842" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  );
}



// ─── Hero Section ─────────────────────────────────────────────────────────────
export default function HeroSection({ auth }) {
  const heroRef = useRef(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradShift {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.5; }
          50%     { opacity: 1; }
        }
        @keyframes borderPulse {
          0%,100% { opacity: 0.35; }
          50%     { opacity: 0.85; }
        }
        @keyframes runeEdgePulse {
          0%,100% { opacity: 0.08; }
          50%     { opacity: 0.22; }
        }
        @keyframes spinCW  { to { transform: translate(-50%,-50%) rotate(360deg);  } }
        @keyframes spinCCW { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        .hero-ring {
          position: absolute;
          border-radius: 50%;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .hero-ring-1 { width:340px;height:340px; border:1px solid rgba(245,200,66,0.1);  animation: spinCW  18s linear infinite; }
        .hero-ring-2 { width:460px;height:460px; border:1px solid rgba(16,185,129,0.07); animation: spinCCW 24s linear infinite; }
        .hero-ring-3 { width:560px;height:560px; border:1px solid rgba(59,158,255,0.05); animation: spinCW  32s linear infinite; }

        .hero-grad-title {
          background: linear-gradient(135deg, #f5c842 0%, #10b981 50%, #f5c842 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 4s ease infinite;
        }
      `}</style>

      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: '#080b16' }}
      >
        {/* ── Background webp ── */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/dungeon-image.webp"
            alt="Dungeon landscape"
            className="w-full h-full object-cover"
            style={{ opacity: 0.38 }}
          />
        </div>

        {/* ── Gradient overlays ── */}
        <div className="absolute inset-0 z-1" style={{
          background: 'linear-gradient(to bottom, rgba(8,11,22,0.55) 0%, rgba(8,11,22,0.05) 40%, rgba(8,11,22,0.05) 60%, rgba(8,11,22,0.92) 100%)',
        }} />
        <div className="absolute inset-0 z-2" style={{
          background: 'radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, rgba(8,11,22,0.68) 100%)',
        }} />

        {/* ── Ambient glow behind title ── */}
        <div className="absolute pointer-events-none" style={{
          zIndex: 2, width: 600, height: 300,
          left: '50%', top: '48%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)',
          animation: 'glowPulse 4s ease-in-out infinite',
        }} />

        {/* ── Arcane frame ── */}
        <ArcaneFrame />

        {/* ── Spinning rings ── */}
        <div className="hero-ring hero-ring-1" style={{ zIndex: 3 }} />
        <div className="hero-ring hero-ring-2" style={{ zIndex: 3 }} />
        <div className="hero-ring hero-ring-3" style={{ zIndex: 3 }} />

        {/* ── Edge rune columns ── */}
        <EdgeRunes />

        {/* ── Floating rune canvas ── */}
        <RuneCanvas heroRef={heroRef} />

        {/* ── Main content ── */}
        <div className="relative text-center px-6 max-w-3xl mx-auto" style={{ zIndex: 10 }}>

          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2.5 mb-5"
            style={{ animation: 'fadeInDown 0.8s ease forwards' }}
          >
            <div style={{ width: 32, height: 1, background: 'rgba(245,200,66,0.5)' }} />
            <span style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 500,
              fontSize: 10, letterSpacing: '0.45em',
              textTransform: 'uppercase', color: '#f5c842', opacity: 0.8,
            }}>
              An Endless Adventure Awaits
            </span>
            <div style={{ width: 32, height: 1, background: 'rgba(245,200,66,0.5)' }} />
          </div>

          {/* Title */}
          <h1
            className="hero-grad-title"
            style={{
              fontFamily: 'Poppins, sans-serif', fontWeight: 800,
              fontSize: 'clamp(52px, 10vw, 96px)', lineHeight: 1,
              letterSpacing: '-0.02em', marginBottom: 12,
              animation: 'fadeInUp 0.9s 0.15s ease both',
            }}
          >
            LOREFORGE
          </h1>

          {/* Sub-tagline */}
          <p style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 500,
            fontSize: 'clamp(10px, 1.4vw, 12px)',
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)', marginBottom: 28,
            animation: 'fadeInUp 0.9s 0.25s ease both',
          }}>
            Forge Your Legend &nbsp;·&nbsp; Shape Your Destiny
          </p>

          {/* Ornamental divider */}
          <div
            className="flex items-center justify-center gap-3 mb-7"
            style={{ animation: 'fadeInUp 0.9s 0.3s ease both' }}
          >
            <div style={{ height: 1, width: 56, background: 'linear-gradient(to right, transparent, rgba(245,200,66,0.4))' }} />
            <span style={{ color: '#f5c842', opacity: 0.45, fontSize: 12 }}>⚔</span>
            <div style={{ height: 1, width: 56, background: 'linear-gradient(to left, transparent, rgba(245,200,66,0.4))' }} />
          </div>

          {/* Subtitle */}
          <p style={{
            fontFamily: 'Poppins, sans-serif', fontWeight: 300,
            fontSize: 'clamp(14px, 2vw, 17px)', lineHeight: 1.75,
            color: 'rgba(255,255,255,0.62)', maxWidth: 540, margin: '0 auto 44px',
            animation: 'fadeInUp 0.9s 0.35s ease both',
          }}>
            Choose your destiny in a world of endless adventures where every choice shapes your legend and every path leads to glory.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ animation: 'fadeInUp 0.9s 0.45s ease both' }}
          >
            {auth?.user ? (
              <Link
                href={route('dashboard')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white"
                style={{
                  fontFamily: 'Poppins, sans-serif', letterSpacing: '0.08em',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(16,185,129,0.35)'; }}
              >
                <i className="fas fa-crown" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={route('register')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white"
                  style={{
                    fontFamily: 'Poppins, sans-serif', letterSpacing: '0.08em',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(16,185,129,0.35)'; }}
                >
                  <i className="fas fa-play" />
                  Start Your Journey
                </Link>
                <Link
                  href={route('login')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm"
                  style={{
                    fontFamily: 'Poppins, sans-serif', letterSpacing: '0.08em',
                    background: 'transparent',
                    border: '1.5px solid rgba(255,255,255,0.22)',
                    color: 'rgba(255,255,255,0.78)',
                    transition: 'transform 0.25s, border-color 0.25s, background 0.25s, color 0.25s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.borderColor = 'rgba(245,200,66,0.55)'; e.currentTarget.style.background = 'rgba(245,200,66,0.07)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.78)'; }}
                >
                  <i className="fas fa-book-open" />
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>


      </section>
    </>
  );
}