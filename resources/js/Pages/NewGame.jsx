import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useRef, useEffect } from 'react';

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

export default function NewGame() {
    const [selectedGenre, setSelectedGenre] = useState('');
    const [characterName, setCharacterName] = useState('');
    const [maxTurns, setMaxTurns] = useState(20);
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const genres = [
        {
            id: 'fantasy',
            name: 'FANTASY',
            icon: 'fas fa-hat-wizard',
            description: 'Embark on epic quests through enchanted forests, ancient castles, and magical realms filled with mythical creatures.',
            accent: '#C9A84C',
            accentGlow: 'rgba(201,168,76,0.4)',
            accentDim: 'rgba(201,168,76,0.22)',
            gradientFrom: '#C9A84C',
            gradientTo: '#8B0000',
            sprite: '/Sprites/Fantasy/Player.gif'
        },
        {
            id: 'horror',
            name: 'HORROR',
            icon: 'fas fa-ghost',
            description: 'Face your deepest fears in dark, atmospheric worlds where terror lurks around every shadowed corner.',
            accent: '#8B0000',
            accentGlow: 'rgba(139,0,0,0.4)',
            accentDim: 'rgba(139,0,0,0.22)',
            gradientFrom: '#8B0000',
            gradientTo: '#4A7C1A',
            sprite: '/Sprites/Horror/Player.gif'
        },
        {
            id: 'scifi',
            name: 'SCI-FI',
            icon: 'fas fa-rocket',
            description: 'Journey through the cosmos, explore advanced technologies, and discover mysteries of the universe.',
            accent: '#00BFFF',
            accentGlow: 'rgba(0,191,255,0.4)',
            accentDim: 'rgba(0,191,255,0.22)',
            gradientFrom: '#00BFFF',
            gradientTo: '#0080FF',
            sprite: '/Sprites/Sci-fi/Player.png'
        }
    ];

    const handleStartGame = async () => {
        setLocalError('');
        setLoading(true);
        
        if (!selectedGenre || !characterName) {
            setLocalError('Please enter a character name and select a genre.');
            setLoading(false);
            return;
        }

        if (characterName.length < 2) {
            setLocalError('Character name must be at least 2 characters long.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    genre: selectedGenre,
                    character_name: characterName,
                    max_turns: maxTurns
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to start game');
            }

            // Redirect to game page on success
            window.location.href = '/game';
        } catch (err) {
            console.error('Failed to start game:', err);
            setLocalError(err.message || 'Failed to start game. Please try again.');
            setLoading(false);
        }
    };

    const handleSessionLengthChange = (length) => {
        const turnMap = {
            'Quick (30 min)': 10,
            'Standard (1-2 hours)': 20,
            'Extended (3+ hours)': 30
        };
        setMaxTurns(turnMap[length] || 20);
    };

    const handleShareCampaign = () => {
        // Placeholder for share functionality
        alert('Share campaign feature coming soon!');
    };

    return (
        <AuthenticatedLayout>
            <Head title="New Adventure" />
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                @keyframes spin        { to { transform: rotate(360deg);  } }
                @keyframes spinReverse { to { transform: rotate(-360deg); } }
            `}</style>

            <section className="relative min-h-screen overflow-hidden bg-surface-dark-charcoal/50 backdrop-blur-sm">
                <ConstellationBackground />

                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <div className="h-px w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(245,200,66,0.35))' }} />
                            <span style={{ color: '#f5c842', opacity: 0.45, fontFamily: 'Poppins', fontSize: 14 }}>⚔</span>
                            <div className="h-px w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(245,200,66,0.35))' }} />
                        </div>
                        <p className="uppercase mb-3" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, fontSize: 10, letterSpacing: '0.45em', color: '#10b981', opacity: 0.65 }}>
                            Begin Your Journey
                        </p>
                        <h1 className="font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 'clamp(36px, 6vw, 56px)', color: '#f0ead6' }}>
                            CREATE NEW{' '}
                            <span style={{ background: 'linear-gradient(135deg, #2D7A4F 30%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
                                ADVENTURE
                            </span>
                        </h1>
                        <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 300, fontSize: '1rem', color: '#8899aa', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
                            Craft your character, choose your realm, and embark on an epic solo adventure through infinite possibilities.
                        </p>
                    </div>

                    {/* Character Name Section */}
                    <div className="max-w-2xl mx-auto mb-10">
                        <div className="relative" style={{ background: 'linear-gradient(145deg, rgba(18,20,30,0.85) 0%, rgba(22,26,40,0.9) 100%)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <label className="block text-sm font-medium mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Character Name
                            </label>
                            <input
                                type="text"
                                value={characterName}
                                onChange={(e) => setCharacterName(e.target.value)}
                                placeholder="Enter your hero's name..."
                                className="w-full px-4 py-3 bg-surface-dark-charcoal/50 border border-border-subtle-dark/50 rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:outline-none focus:ring-2 focus:ring-accent-emerald-green focus:border-transparent transition-all duration-300"
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            />
                        </div>
                    </div>

                    {/* Genre Selection */}
                    <div className="mb-12">
                        <h2 className="text-center mb-8" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#f0ead6' }}>
                            Choose Your Realm
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {genres.map((genre) => {
                                const [hovered, setHovered] = useState(false);
                                const cornerDefs = [
                                    { pos: 'top-1.5 left-1.5',    d: 'M0 10 L0 0 L10 0' },
                                    { pos: 'top-1.5 right-1.5',   d: 'M0 0 L10 0 L10 10' },
                                    { pos: 'bottom-1.5 left-1.5', d: 'M0 0 L0 10 L10 10' },
                                    { pos: 'bottom-1.5 right-1.5',d: 'M10 0 L10 10 L0 10' },
                                ];

                                return (
                                    <div
                                        key={genre.id}
                                        className="relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105"
                                        style={{
                                            background: 'linear-gradient(145deg, rgba(18,20,30,0.85) 0%, rgba(22,26,40,0.9) 100%)',
                                            border: `2px solid ${selectedGenre === genre.id ? genre.accent : hovered ? genre.accentDim : 'rgba(255,255,255,0.1)'}`,
                                            boxShadow: hovered ? `0 0 36px ${genre.accentGlow}, 0 20px 60px rgba(0,0,0,0.7)` : '0 4px 24px rgba(0,0,0,0.4)',
                                            backdropFilter: 'blur(10px)',
                                            transform: hovered ? 'scale(1.045) translateY(-5px)' : 'scale(1)',
                                            transition: 'transform 0.45s cubic-bezier(.23,1.02,.32,1), border-color 0.4s, box-shadow 0.4s',
                                        }}
                                        onClick={() => setSelectedGenre(genre.id)}
                                        onMouseEnter={() => setHovered(true)}
                                        onMouseLeave={() => setHovered(false)}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.5s', zIndex: 1 }}>
                                            {[38, 58, 78].map((size, i) => (
                                                <div key={i} className="absolute rounded-full" style={{ width: `${size}%`, height: `${size}%`, border: `1px solid ${genre.accent}`, opacity: 0.18, animation: `${i % 2 === 0 ? 'spin' : 'spinReverse'} ${7 + i * 3}s linear infinite` }} />
                                            ))}
                                        </div>

                                        <RuneParticles active={hovered} color={genre.accent} />

                                        {cornerDefs.map(({ pos, d }, i) => (
                                            <div key={i} className={`absolute ${pos}`} style={{ opacity: hovered ? 0.7 : 0.2, transition: 'opacity 0.4s', zIndex: 4 }}>
                                                <svg viewBox="0 0 10 10" width="14" height="14"><path d={d} stroke={genre.accent} strokeWidth="1.5" fill="none" /></svg>
                                            </div>
                                        ))}

                                        <div className="relative p-8 text-center" style={{ zIndex: 5 }}>
                                            {/* Dynamic Sprite Display */}
                                            <div className="relative inline-flex items-center justify-center mb-5">
                                                <div className="absolute rounded-full" style={{ width: hovered ? '120px' : '100px', height: hovered ? '120px' : '100px', background: genre.accent, filter: 'blur(25px)', opacity: hovered ? 0.3 : 0, transition: 'opacity 0.4s, width 0.4s, height 0.4s' }} />
                                                <img 
                                                    src={genre.sprite} 
                                                    alt={`${genre.name} Character`}
                                                    className="w-20 h-20 object-contain"
                                                    style={{ 
                                                        filter: hovered ? `drop-shadow(0 0 20px ${genre.accent}) contrast(1.2) brightness(1.1)` : 'contrast(1.2) brightness(1.1)',
                                                        transform: hovered ? 'scale(1.1)' : 'scale(1)',
                                                        transition: 'transform 0.4s, filter 0.4s',
                                                        mixBlendMode: 'lighten',
                                                        opacity: 0.9
                                                    }}
                                                />
                                            </div>

                                            <h3 className="text-2xl font-bold tracking-widest uppercase mb-3" style={{ fontFamily: "'Poppins', sans-serif", color: genre.accent, textShadow: hovered ? `0 0 18px ${genre.accent}` : 'none', transition: 'text-shadow 0.4s' }}>
                                                {genre.name}
                                            </h3>

                                            <div className="flex items-center gap-2 my-3">
                                                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${genre.accent}55)` }} />
                                                <span style={{ color: genre.accent, opacity: 0.6, fontSize: 10 }}>✦</span>
                                                <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${genre.accent}55)` }} />
                                            </div>

                                            <p className="text-sm leading-relaxed mb-6" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300, color: '#8899aa' }}>
                                                {genre.description}
                                            </p>

                                            <div className={`w-full py-3 px-5 font-semibold uppercase rounded-xl text-center ${selectedGenre === genre.id ? 'ring-2 ring-offset-2 ring-offset-surface-dark-charcoal' : ''}`} style={{ 
                                                background: selectedGenre === genre.id ? `linear-gradient(135deg, ${genre.gradientFrom}, ${genre.gradientTo})` : 'transparent', 
                                                color: selectedGenre === genre.id ? (genre.id === 'fantasy' ? '#1a1000' : '#fff') : genre.accent, 
                                                fontFamily: "'Poppins', sans-serif", 
                                                letterSpacing: '0.12em', 
                                                fontSize: '11px', 
                                                border: selectedGenre === genre.id ? 'none' : `2px solid ${genre.accent}`,
                                                cursor: 'pointer',
                                                boxShadow: selectedGenre === genre.id ? `0 4px 18px ${genre.accentGlow}` : 'none',
                                                transition: 'all 0.3s'
                                            }}>
                                                {selectedGenre === genre.id ? '✓ SELECTED' : 'SELECT REALM'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Session Length */}
                    <div className="max-w-md mx-auto mb-10">
                        <div className="relative" style={{ background: 'linear-gradient(145deg, rgba(18,20,30,0.85) 0%, rgba(22,26,40,0.9) 100%)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(10px)' }}>
                            <label className="block text-sm font-medium mb-3" style={{ fontFamily: 'Poppins, sans-serif', color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Adventure Length
                            </label>
                            <select 
                                className="w-full px-4 py-3 bg-surface-dark-charcoal/50 border border-border-subtle-dark/50 rounded-lg text-text-primary-off-white focus:outline-none focus:ring-2 focus:ring-accent-emerald-green focus:border-transparent"
                                onChange={(e) => handleSessionLengthChange(e.target.value)}
                                style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                                <option>Standard (1-2 hours)</option>
                                <option>Quick (30 min)</option>
                                <option>Extended (3+ hours)</option>
                            </select>
                        </div>
                    </div>

                    {/* Error Display */}
                    {localError && (
                        <div className="max-w-2xl mx-auto mb-8 bg-red-900/50 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
                            <p className="text-red-300 mb-2 text-center">{localError}</p>
                            <button 
                                onClick={() => setLocalError('')}
                                className="text-xs text-red-400 hover:text-red-300 underline block mx-auto"
                            >
                                Clear error
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={handleStartGame}
                            className="px-8 py-4 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                            style={{ 
                                background: 'linear-gradient(135deg, #10b981, #059669)', 
                                color: '#fff',
                                fontFamily: "'Poppins', sans-serif",
                                letterSpacing: '0.1em',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                            disabled={!characterName || !selectedGenre || loading}
                        >
                            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-play'} mr-2`}></i>
                            {loading ? 'Creating Adventure...' : 'Start Adventure'}
                        </button>

                        <button 
                            onClick={handleShareCampaign}
                            className="px-8 py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                            style={{ 
                                background: 'transparent', 
                                color: '#10b981',
                                fontFamily: "'Poppins', sans-serif",
                                letterSpacing: '0.1em',
                                fontSize: '14px',
                                textTransform: 'uppercase',
                                border: '2px solid #10b981',
                                cursor: 'pointer'
                            }}
                        >
                            <i className="fas fa-share-alt mr-2"></i>
                            Share Campaign
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-16">
                        <div className="h-px w-28" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))' }} />
                        <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, letterSpacing: 6 }}>✦ ✦ ✦</span>
                        <div className="h-px w-28" style={{ background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))' }} />
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
