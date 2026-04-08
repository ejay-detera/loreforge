import { useRef, useEffect, useState } from 'react';
import { useScrollReveal, revealStyle } from '@/hooks/UseScrollReveal';

// ─── Constellation Background ─────────────────────────────────────────────────
function ConstellationBackground() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const starsRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const MAX_DIST = 140;
    const STAR_COUNT = 110;

    const init = () => {
      const W = canvas.width  = section.offsetWidth;
      const H = canvas.height = section.offsetHeight;
      starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: 0.8 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.012 + Math.random() * 0.018,
      }));
    };

    const ctx = canvas.getContext('2d');

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;
      const stars = starsRef.current;
      const mouse = mouseRef.current;
      const now = Date.now() * 0.001;

      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.x += s.vx; s.y += s.vy;
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      });

      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i], b = stars[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > MAX_DIST) continue;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          const mdx = mx - mouse.x, mdy = my - mouse.y;
          const mouseBoost = Math.max(0, 1 - Math.sqrt(mdx * mdx + mdy * mdy) / 180);
          const alpha = (1 - dist / MAX_DIST) * 0.14 + mouseBoost * 0.4;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${Math.round(80+mouseBoost*90)},${Math.round(90+mouseBoost*35)},${Math.round(150+mouseBoost*70)},${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6 + mouseBoost * 0.7; ctx.stroke();
        }
      }

      stars.forEach(s => {
        const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * s.speed * 60 + s.phase));
        const dx = s.x - mouse.x, dy = s.y - mouse.y;
        const boost = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 150);
        if (boost > 0.1) {
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
          grd.addColorStop(0, `rgba(167,139,250,${boost * 0.22})`);
          grd.addColorStop(1, 'rgba(167,139,250,0)');
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 + boost * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${twinkle * (0.35 + boost * 0.55)})`; ctx.fill();
      });
    };

    const onMouseMove  = (e) => { const r = section.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', init);
    setTimeout(() => { init(); draw(); }, 80);
    return () => {
      cancelAnimationFrame(animRef.current);
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', init);
    };
  }, []);

  return (
    <div ref={sectionRef} className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
    </div>
  );
}

// ─── Rune Particles ───────────────────────────────────────────────────────────
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');

function RuneParticles({ active, color }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!active) { setParticles([]); return; }
    const spawn = () => Array.from({ length: 7 }, (_, i) => ({
      id: i + Date.now(), rune: RUNES[Math.floor(Math.random() * RUNES.length)],
      x: 6 + Math.random() * 88, y: 68 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 1.2, vy: -(0.8 + Math.random() * 1.4),
      life: 1, size: 11 + Math.random() * 9,
      rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 4,
    }));
    setParticles(spawn());
    const interval = setInterval(() => setParticles(spawn()), 600);
    return () => clearInterval(interval);
  }, [active]);
  useEffect(() => {
    if (!active || particles.length === 0) return;
    let frame;
    const animate = () => {
      setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.018, rotation: p.rotation + p.rotSpeed })).filter(p => p.life > 0));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, particles.length]);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }}>
      {particles.map(p => (
        <div key={p.id} className="absolute select-none font-bold" style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, color, opacity: p.life * 0.8, transform: `rotate(${p.rotation}deg)`, textShadow: `0 0 8px ${color}` }}>
          {p.rune}
        </div>
      ))}
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, badge, accent, accentGlow, accentDim, gradFrom, gradTo, revealDelay }) {
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useScrollReveal(0.12);

  const corners = [
    { pos: 'top-2 left-2',    d: 'M0 10 L0 0 L10 0' },
    { pos: 'top-2 right-2',   d: 'M0 0 L10 0 L10 10' },
    { pos: 'bottom-2 left-2', d: 'M0 0 L0 10 L10 10' },
    { pos: 'bottom-2 right-2',d: 'M10 0 L10 10 L0 10' },
  ];

  return (
    <div ref={ref} style={revealStyle(visible, revealDelay, 'up', 36)} className="h-full">
      <div
        className="relative rounded-2xl overflow-hidden cursor-default text-center h-full"
        style={{
          background: 'linear-gradient(150deg, rgba(18,20,30,0.88) 0%, rgba(22,26,40,0.92) 100%)',
          border: `1.5px solid ${hovered ? accent : accentDim}`,
          backdropFilter: 'blur(10px)',
          padding: '40px 32px 36px',
          transform: hovered ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)',
          boxShadow: hovered ? `0 0 32px ${accentGlow}, 0 24px 60px rgba(0,0,0,0.6)` : '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'transform 0.45s cubic-bezier(.23,1.02,.32,1), border-color 0.4s, box-shadow 0.4s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.5s', zIndex: 1 }}>
          {[35, 55, 72].map((s, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: `${s}%`, height: `${s}%`, border: `1px solid ${accent}`, opacity: 0.14, animation: `${i % 2 === 0 ? 'spin' : 'spinReverse'} ${8 + i * 3}s linear infinite` }} />
          ))}
        </div>

        <RuneParticles active={hovered} color={accent} />

        {corners.map(({ pos, d }, i) => (
          <div key={i} className={`absolute ${pos}`} style={{ opacity: hovered ? 0.65 : 0.18, transition: 'opacity 0.4s', zIndex: 4 }}>
            <svg viewBox="0 0 10 10" width="14" height="14"><path d={d} stroke={accent} strokeWidth="1.5" fill="none" /></svg>
          </div>
        ))}

        <div className="relative" style={{ zIndex: 5 }}>
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute rounded-full" style={{ width: '80px', height: '80px', background: accent, filter: 'blur(24px)', opacity: hovered ? 0.25 : 0, transition: 'opacity 0.4s' }} />
            <div style={{ width: 68, height: 68, borderRadius: 16, background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hovered ? 'scale(1.1) translateY(-3px)' : 'scale(1)', boxShadow: hovered ? `0 8px 28px ${accentGlow}` : 'none', transition: 'transform 0.4s, box-shadow 0.4s', position: 'relative', zIndex: 1 }}>
              <i className={`${icon} text-white`} style={{ fontSize: 26 }} />
            </div>
          </div>

          <h3 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 600, color: '#f0ead6', letterSpacing: '0.06em', marginBottom: 8, textShadow: hovered ? `0 0 16px ${accent}` : 'none', transition: 'text-shadow 0.4s' }}>
            {title}
          </h3>

          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${accent} 50%, transparent)`, opacity: 0.3, margin: '10px 0 14px' }} />

          <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize: '0.875rem', lineHeight: 1.75, color: '#6b7a99' }}>
            {description}
          </p>

          <div style={{ display: 'inline-block', marginTop: 18, padding: '4px 14px', borderRadius: 30, fontFamily: "'Poppins', sans-serif", fontSize: 9, letterSpacing: '0.14em', fontWeight: 600, background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}`, color: accent, opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.4s 0.1s, transform 0.4s 0.1s' }}>
            {badge}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function WhyLoreForge() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.2);

  const features = [
    { icon: 'fas fa-infinity', title: 'Infinite Worlds', description: 'Explore limitless procedurally generated realms — no two adventures are ever the same.', badge: 'BOUNDLESS EXPLORATION', accent: '#10b981', accentGlow: 'rgba(16,185,129,0.32)', accentDim: 'rgba(16,185,129,0.16)', gradFrom: '#10b981', gradTo: '#059669' },
    { icon: 'fas fa-users', title: 'Multiplayer', description: 'Join forces with adventurers from across the world and write your legend together.', badge: 'UP TO 8 PLAYERS', accent: '#f5c842', accentGlow: 'rgba(245,200,66,0.32)', accentDim: 'rgba(245,200,66,0.16)', gradFrom: '#f5c842', gradTo: '#d4920d' },
    { icon: 'fas fa-code', title: 'Mod Support', description: 'Create, share, and install custom content — shape the world entirely on your own terms.', badge: 'OPEN MODDING API', accent: '#3b9eff', accentGlow: 'rgba(59,158,255,0.32)', accentDim: 'rgba(59,158,255,0.16)', gradFrom: '#3b9eff', gradTo: '#1a6fcc' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @keyframes spin        { to { transform: rotate(360deg);  } }
        @keyframes spinReverse { to { transform: rotate(-360deg); } }
      `}</style>

      <section className="relative z-10 py-24 overflow-hidden bg-bg-deep-navy/50">
        <ConstellationBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header fades up as a unit */}
          <div ref={headerRef} className="text-center mb-16" style={revealStyle(headerVisible, 0, 'up', 24)}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.35))' }} />
              <span style={{ color: '#a78bfa', opacity: 0.45, fontSize: 14 }}>✦</span>
              <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(167,139,250,0.35))' }} />
            </div>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 10, letterSpacing: '0.45em', color: '#a78bfa', opacity: 0.7, textTransform: 'uppercase', marginBottom: 12 }}>
              The Forge's Gift
            </p>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(26px, 5vw, 46px)', color: '#f0ead6', marginBottom: 14 }}>
              WHY CHOOSE{' '}
              <span style={{ background: 'linear-gradient(135deg, #2D7A4F 30%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
                LOREFORGE
              </span>
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: '#6b7a99', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
              Forged from ancient craft and modern magic — every feature built to deepen your legend.
            </p>
          </div>

          {/* Cards — staggered 0, 0.12s, 0.24s */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => <FeatureCard key={f.title} {...f} revealDelay={i * 0.12} />)}
          </div>

          <div className="flex items-center justify-center gap-4 mt-16">
            <div className="h-px w-28" style={{ background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.18))' }} />
            <span style={{ color: 'rgba(167,139,250,0.18)', fontSize: 11, letterSpacing: 6 }}>✦ ✦ ✦</span>
            <div className="h-px w-28" style={{ background: 'linear-gradient(to left, transparent, rgba(167,139,250,0.18))' }} />
          </div>
        </div>
      </section>
    </>
  );
}