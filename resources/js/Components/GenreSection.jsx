import { useRef, useEffect, useState } from 'react';
import { useScrollReveal, revealStyle } from '@/hooks/UseScrollReveal';

// ─── Constellation Background ─────────────────────────────────────────
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
    const spawn = () => Array.from({ length: 8 }, (_, i) => ({
      id: i + Date.now(), rune: RUNES[Math.floor(Math.random() * RUNES.length)],
      x: 6 + Math.random() * 88, y: 74 + Math.random() * 16,
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

// ─── Genre Card ───────────────────────────────────────────────────────────────
function GenreCard({ title, icon, description, buttonLabel, buttonIcon, accent, accentGlow, accentDim, gradientFrom, gradientTo, btnColor, revealDelay }) {
  const [hovered, setHovered] = useState(false);
  const { ref, visible } = useScrollReveal(0.12);

  const cornerDefs = [
    { pos: 'top-1.5 left-1.5',    d: 'M0 10 L0 0 L10 0' },
    { pos: 'top-1.5 right-1.5',   d: 'M0 0 L10 0 L10 10' },
    { pos: 'bottom-1.5 left-1.5', d: 'M0 0 L0 10 L10 10' },
    { pos: 'bottom-1.5 right-1.5',d: 'M10 0 L10 10 L0 10' },
  ];

  return (
    // Outer wrapper carries the scroll-reveal fade; inner carries the hover transform
    <div ref={ref} style={revealStyle(visible, revealDelay, 'up', 36)}>
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: 'linear-gradient(145deg, rgba(18,20,30,0.85) 0%, rgba(22,26,40,0.9) 100%)',
          border: `2px solid ${hovered ? accent : accentDim}`,
          boxShadow: hovered ? `0 0 36px ${accentGlow}, 0 20px 60px rgba(0,0,0,0.7)` : '0 4px 24px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          transform: hovered ? 'scale(1.045) translateY(-5px)' : 'scale(1)',
          transition: 'transform 0.45s cubic-bezier(.23,1.02,.32,1), border-color 0.4s, box-shadow 0.4s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.5s', zIndex: 1 }}>
          {[38, 58, 78].map((size, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: `${size}%`, height: `${size}%`, border: `1px solid ${accent}`, opacity: 0.18, animation: `${i % 2 === 0 ? 'spin' : 'spinReverse'} ${7 + i * 3}s linear infinite` }} />
          ))}
        </div>

        <RuneParticles active={hovered} color={accent} />

        {cornerDefs.map(({ pos, d }, i) => (
          <div key={i} className={`absolute ${pos}`} style={{ opacity: hovered ? 0.7 : 0.2, transition: 'opacity 0.4s', zIndex: 4 }}>
            <svg viewBox="0 0 10 10" width="14" height="14"><path d={d} stroke={accent} strokeWidth="1.5" fill="none" /></svg>
          </div>
        ))}

        <div className="relative p-8 text-center" style={{ zIndex: 5 }}>
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute rounded-full" style={{ width: hovered ? '90px' : '72px', height: hovered ? '90px' : '72px', background: accent, filter: 'blur(22px)', opacity: hovered ? 0.35 : 0, transition: 'opacity 0.4s, width 0.4s, height 0.4s' }} />
            <i className={`${icon} text-5xl`} style={{ color: accent, textShadow: hovered ? `0 0 22px ${accent}, 0 0 44px ${accentGlow}` : `0 0 8px ${accentGlow}`, transform: hovered ? 'scale(1.2) translateY(-3px)' : 'scale(1)', transition: 'transform 0.4s, text-shadow 0.4s' }} />
          </div>

          <h3 className="text-2xl font-bold tracking-widest uppercase mb-1" style={{ fontFamily: "'Poppins', sans-serif", color: accent, textShadow: hovered ? `0 0 18px ${accent}` : 'none', transition: 'text-shadow 0.4s' }}>
            {title}
          </h3>

          <div className="flex items-center gap-2 my-3">
            <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}55)` }} />
            <span style={{ color: accent, opacity: 0.6, fontSize: 10 }}>✦</span>
            <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${accent}55)` }} />
          </div>

          <p className="mb-6 text-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, color: '#8899aa' }}>
            {description}
          </p>

          <button className="w-full py-3 px-5 font-semibold uppercase rounded-xl" style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`, color: btnColor, fontFamily: "'Poppins', sans-serif", letterSpacing: '0.12em', fontSize: '11px', border: 'none', cursor: 'pointer', boxShadow: hovered ? `0 4px 18px ${accentGlow}` : 'none', transition: 'box-shadow 0.3s' }}>
            <i className={`${buttonIcon} mr-2`} />
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function GenreSection() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.2);

  const genres = [
    { title: 'FANTASY', icon: 'fas fa-hat-wizard', description: 'Embark on epic quests through enchanted forests, ancient castles, and magical realms filled with mythical creatures and legendary treasures.', buttonLabel: 'Explore Fantasy', buttonIcon: 'fas fa-dragon', accent: '#C9A84C', accentGlow: 'rgba(201,168,76,0.4)', accentDim: 'rgba(201,168,76,0.22)', btnColor: '#1a1000', gradientFrom: '#C9A84C', gradientTo: '#8B0000' },
    { title: 'HORROR', icon: 'fas fa-ghost', description: 'Face your deepest fears in dark, atmospheric worlds where survival is never guaranteed and terror lurks around every shadowed corner.', buttonLabel: 'Face Your Fears', buttonIcon: 'fas fa-skull', accent: '#8B0000', accentGlow: 'rgba(139,0,0,0.4)', accentDim: 'rgba(139,0,0,0.22)', btnColor: '#fff', gradientFrom: '#8B0000', gradientTo: '#4A7C1A' },
    { title: 'SCI-FI', icon: 'fas fa-rocket', description: 'Journey through the cosmos, explore advanced technologies, and discover mysteries of the universe in futuristic interstellar adventures.', buttonLabel: 'Launch Adventure', buttonIcon: 'fas fa-satellite', accent: '#00BFFF', accentGlow: 'rgba(0,191,255,0.4)', accentDim: 'rgba(0,191,255,0.22)', btnColor: '#fff', gradientFrom: '#00BFFF', gradientTo: '#0080FF' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        @keyframes spin        { to { transform: rotate(360deg);  } }
        @keyframes spinReverse { to { transform: rotate(-360deg); } }
      `}</style>

      <section className="relative z-10 py-24 overflow-hidden bg-surface-dark-charcoal/50 backdrop-blur-sm">
        <ConstellationBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header fades up as a unit */}
          <div ref={headerRef} className="text-center mb-16" style={revealStyle(headerVisible, 0, 'up', 24)}>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(245,200,66,0.35))' }} />
              <span style={{ color: '#f5c842', opacity: 0.45, fontFamily: 'Poppins', fontSize: 14 }}>⚔</span>
              <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(245,200,66,0.35))' }} />
            </div>
            <p className="uppercase mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 10, letterSpacing: '0.45em', color: '#10b981', opacity: 0.65 }}>
              Select Your Path
            </p>
            <h2 className="font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(28px, 5vw, 48px)', color: '#f0ead6' }}>
              CHOOSE YOUR{' '}
              <span style={{ background: 'linear-gradient(135deg, #2D7A4F 30%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
                GENRE
              </span>
            </h2>
            <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '0.95rem', color: '#8899aa', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Select your preferred adventure style and begin your journey through realms of infinite possibility.
            </p>
          </div>

          {/* Cards — staggered 0, 0.12s, 0.24s */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {genres.map((g, i) => <GenreCard key={g.title} {...g} revealDelay={i * 0.12} />)}
          </div>

          <div className="flex items-center justify-center gap-4 mt-16">
            <div className="h-px w-28" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))' }} />
            <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, letterSpacing: 6 }}>✦ ✦ ✦</span>
            <div className="h-px w-28" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))' }} />
          </div>
        </div>
      </section>
    </>
  );
}