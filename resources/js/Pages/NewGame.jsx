import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import GenreContainer from '@/Components/Game/GenreContainer';

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
        const MAX_DIST = 140, STAR_COUNT = 110;
        const init = () => {
            const W = canvas.width = section.offsetWidth;
            const H = canvas.height = section.offsetHeight;
            starsRef.current = Array.from({ length: STAR_COUNT }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
                r: 0.8 + Math.random() * 1.6,
                phase: Math.random() * Math.PI * 2, speed: 0.012 + Math.random() * 0.018,
            }));
        };
        const ctx = canvas.getContext('2d');
        const draw = () => {
            animRef.current = requestAnimationFrame(draw);
            const W = canvas.width, H = canvas.height;
            const stars = starsRef.current, mouse = mouseRef.current, now = Date.now() * 0.001;
            ctx.clearRect(0, 0, W, H);
            stars.forEach(s => {
                s.x += s.vx; s.y += s.vy;
                if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
                if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
            });
            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < stars.length; j++) {
                    const a = stars[i], b = stars[j];
                    const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > MAX_DIST) continue;
                    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                    const mdx = mx - mouse.x, mdy = my - mouse.y;
                    const mouseBoost = Math.max(0, 1 - Math.sqrt(mdx * mdx + mdy * mdy) / 180);
                    const alpha = (1 - dist / MAX_DIST) * 0.14 + mouseBoost * 0.4;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${Math.round(80 + mouseBoost * 90)},${Math.round(90 + mouseBoost * 35)},${Math.round(150 + mouseBoost * 70)},${alpha.toFixed(3)})`;
                    ctx.lineWidth = 0.6 + mouseBoost * 0.7; ctx.stroke();
                }
            }
            stars.forEach(s => {
                const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * s.speed * 60 + s.phase));
                const dx = s.x - mouse.x, dy = s.y - mouse.y;
                const boost = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 150);
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (1 + boost * 0.8), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200,210,255,${twinkle * (0.35 + boost * 0.55)})`; ctx.fill();
            });
        };
        const onMouseMove = (e) => { const r = section.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
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

// ─── Genre data ───────────────────────────────────────────────────────
const genres = [
    {
        id: 'fantasy',
        name: 'FANTASY',
        tagline: 'The Arcane Realm',
        icon: '⚔',
        description: 'Embark on epic quests through enchanted forests, ancient castles, and magical realms filled with mythical creatures and ancient power.',
        accent: '#C9A84C',
        accentGlow: 'rgba(201,168,76,0.5)',
        stats: { power: 70, magic: 90, danger: 60 },
        sprite: '/Sprites/Fantasy/Player.gif',
    },
    {
        id: 'horror',
        name: 'HORROR',
        tagline: 'The Dark Descent',
        icon: '☠',
        description: 'Face your deepest fears in dark, atmospheric worlds where terror lurks around every shadowed corner and survival is never guaranteed.',
        accent: '#CC2200',
        accentGlow: 'rgba(204,34,0,0.5)',
        stats: { power: 85, magic: 50, danger: 100 },
        sprite: '/Sprites/Horror/Player.gif',
    },
    {
        id: 'scifi',
        name: 'SCI-FI',
        tagline: 'The Cosmic Frontier',
        icon: '◈',
        description: 'Journey through the cosmos, explore advanced technologies, and unravel the mysteries of the universe across alien star systems.',
        accent: '#00BFFF',
        accentGlow: 'rgba(0,191,255,0.5)',
        stats: { power: 80, magic: 95, danger: 75 },
        sprite: '/Sprites/Sci-fi/Player.png',
    },
];

// ─── Stat Bar ─────────────────────────────────────────────────────────
function StatBar({ label, value, accent, accentGlow }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, color: accent }}>{value}</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${value}%`,
                    background: accent,
                    boxShadow: `0 0 8px ${accentGlow}`,
                    borderRadius: 3,
                    transition: 'width 0.6s cubic-bezier(.23,1.02,.32,1)',
                }} />
            </div>
        </div>
    );
}

// ─── Genre Thumbnail Card (bottom strip) ────────────────────────────
function GenreThumbnail({ genre, isSelected, onClick }) {
    const [hovered, setHovered] = useState(false);
    const active = isSelected || hovered;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div
                onClick={onClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: 'relative',
                    width: 90,
                    height: 110,
                    cursor: 'pointer',
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: isSelected ? `2px solid ${genre.accent}` : '2px solid rgba(255,255,255,0.12)',
                    boxShadow: isSelected ? `0 0 20px ${genre.accentGlow}` : 'none',
                    transition: 'all 0.25s ease',
                    transform: isSelected ? 'scale(1.08)' : hovered ? 'scale(1.04)' : 'scale(1)',
                    flexShrink: 0,
                }}
            >
                {/* Direct image render without GenreContainer to guarantee visibility */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: isSelected ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)',
                    transition: 'background 0.3s',
                    zIndex: 20,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                    <img
                        src={genre.sprite}
                        alt={genre.name}
                        draggable={false}
                        className="transition-all duration-300 sprite"
                        style={{
                            width: '80%', height: '70%', objectFit: 'contain',
                            filter: active ? `drop-shadow(0 0 10px ${genre.accentGlow}) brightness(1.2)` : 'drop-shadow(0 0 6px rgba(0,0,0,0.8))',
                            transform: active ? 'scale(1.1)' : 'scale(1)',
                        }}
                    />
                </div>

                {/* Lock overlay placeholder for "locked" feel — shown on non-selected, non-hovered */}
                {!isSelected && !hovered && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 25,
                        background: 'rgba(0,0,0,0.15)',
                    }} />
                )}
            </div>

            <span style={{
                fontFamily: 'Poppins, sans-serif', fontSize: 11, letterSpacing: '0.15em',
                fontWeight: 800, textTransform: 'uppercase',
                color: isSelected ? genre.accent : 'rgba(255,255,255,0.4)',
                textShadow: isSelected ? `0 0 10px ${genre.accentGlow}` : 'none',
                transition: 'all 0.3s',
            }}>
                {genre.name}
            </span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function NewGame() {
    const [selectedGenreId, setSelectedGenreId] = useState('fantasy');
    const [characterName, setCharacterName] = useState('');
    const [maxTurns, setMaxTurns] = useState(20);
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);
    const [nameEditing, setNameEditing] = useState(false);

    const selected = genres.find(g => g.id === selectedGenreId) || genres[0];
    const selectedIndex = genres.findIndex(g => g.id === selectedGenreId);

    const cycleLeft = () => {
        const prev = (selectedIndex - 1 + genres.length) % genres.length;
        setSelectedGenreId(genres[prev].id);
    };
    const cycleRight = () => {
        const next = (selectedIndex + 1) % genres.length;
        setSelectedGenreId(genres[next].id);
    };

    const handleStartGame = async () => {
        setLocalError('');
        setLoading(true);
        if (!selectedGenreId || !characterName) {
            setLocalError('Please enter a character name.');
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
                body: JSON.stringify({ genre: selectedGenreId, character_name: characterName, max_turns: maxTurns }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to start game');
            window.location.href = '/game';
        } catch (err) {
            setLocalError(err.message || 'Failed to start game. Please try again.');
            setLoading(false);
        }
    };

    const handleSessionLengthChange = (e) => {
        const map = { 'Quick (30 min)': 10, 'Standard (1-2 hours)': 20, 'Extended (3+ hours)': 30 };
        setMaxTurns(map[e.target.value] || 20);
    };

    return (
        <>
            <Head title="New Adventure" />
            {useEffect(() => {
                const originalOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
                return () => {
                    document.body.style.overflow = originalOverflow;
                };
            }, [])}



            {/* ── Full-screen layout ── */}
            <div
                style={{
                    position: 'relative',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    background: '#0a0a0f',
                    '--genre-accent': selected.accent,
                }}
            >
                {/* ── BIG GENRE BACKGROUND behind everything ── */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <GenreContainer genre={selectedGenreId} style={{ width: '100%', height: '100%' }} />
                    {/* Dark overlay so the UI stays readable */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 10 }} />
                    {/* Scan lines */}
                    <div className="scan-overlay" />
                </div>

                {/* ── TOP BAR ── */}
                <div style={{
                    position: 'relative', zIndex: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 32px 0',
                }}>
                    <span className="char-select-title">Character Select</span>
                    {/* Decorative line */}
                    <div style={{ flex: 1, height: 1, margin: '0 24px', background: 'linear-gradient(to right, rgba(255,255,255,0.15), transparent)' }} />
                    <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
                        SELECT YOUR REALM
                    </span>
                </div>

                {/* ── MAIN CONTENT ── */}
                <div style={{
                    position: 'relative', zIndex: 20,
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0,
                    padding: '24px 32px 0',
                    minHeight: 0,
                }}>

                    {/* LEFT — big sprite + genre name */}
                    <div style={{
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        paddingBottom: 0,
                    }}>
                        {/* Sprite */}
                        <div
                            key={`sprite-${selectedGenreId}`}
                            className="slide-left"
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flex: 1, position: 'relative' }}
                        >
                            <img
                                src={selected.sprite}
                                alt={selected.name}
                                draggable={false}
                                className="sprite"
                                style={{
                                    height: '85%',
                                    maxWidth: '140%',
                                    objectFit: 'contain',
                                    transform: 'scale(1.3) translateY(5%) translateX(10%)',
                                    transformOrigin: 'bottom center',
                                    mixBlendMode: 'lighten',
                                    filter: `drop-shadow(0 0 40px ${selected.accentGlow}) drop-shadow(0 0 80px ${selected.accentGlow}) contrast(1.1) brightness(1.15)`,
                                    position: 'absolute',
                                    bottom: 0,
                                }}
                            />
                        </div>
                    </div>

                    {/* RIGHT — genre name, info panel, inputs */}
                    <div
                        key={`info-${selectedGenreId}`}
                        className="slide-right"
                        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 32, gap: 18 }}
                    >
                        {/* Genre name — big graffiti-style */}
                        <div>
                            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 10, letterSpacing: '0.35em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
                                {selected.tagline}
                            </p>
                            <div
                                className="genre-name-display"
                                style={{
                                    fontFamily: "'Black Han Sans', 'Poppins', sans-serif",
                                    fontSize: 'clamp(52px, 7vw, 80px)',
                                    fontWeight: 900,
                                    color: selected.accent,
                                    textShadow: `0 0 40px ${selected.accentGlow}, 0 0 80px ${selected.accentGlow}`,
                                    lineHeight: 1,
                                    letterSpacing: '0.04em',
                                }}
                            >
                                {selected.name}
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: `linear-gradient(to right, ${selected.accent}55, transparent)` }} />

                        {/* Description */}
                        <p style={{
                            fontFamily: 'Poppins, sans-serif', fontWeight: 300,
                            fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,0.65)',
                            maxWidth: 360,
                        }}>
                            {selected.description}
                        </p>

                        {/* Stats */}
                        <div style={{ maxWidth: 280 }}>
                            <StatBar label="Power" value={selected.stats.power} accent={selected.accent} accentGlow={selected.accentGlow} />
                            <StatBar label="Magic" value={selected.stats.magic} accent={selected.accent} accentGlow={selected.accentGlow} />
                            <StatBar label="Danger" value={selected.stats.danger} accent={selected.accent} accentGlow={selected.accentGlow} />
                        </div>

                        {/* Divider */}
                        <div style={{ height: 1, background: `linear-gradient(to right, ${selected.accent}33, transparent)` }} />

                        {/* Inputs Container */}
                        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            {/* Name input */}
                            <div style={{ flex: '1 1 min-content' }}>
                                <label style={{
                                    fontFamily: 'Poppins, sans-serif', fontSize: 9, letterSpacing: '0.3em',
                                    color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', display: 'block', marginBottom: 8,
                                }}>
                                    Enter Your Name
                                </label>
                                <input
                                    className="name-input"
                                    type="text"
                                    value={characterName}
                                    onChange={e => setCharacterName(e.target.value)}
                                    placeholder="HERO NAME..."
                                    maxLength={24}
                                    style={{ '--genre-accent': selected.accent, maxWidth: '100%', width: 220 }}
                                />
                            </div>

                            {/* Session length */}
                            <div style={{ flex: '1 1 min-content' }}>
                                <label style={{
                                    fontFamily: 'Poppins, sans-serif', fontSize: 9, letterSpacing: '0.3em',
                                    color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', display: 'block', marginBottom: 8,
                                }}>
                                    Adventure Length
                                </label>
                                <select
                                    onChange={handleSessionLengthChange}
                                    style={{
                                        background: 'rgba(0,0,0,0.5)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderBottom: `2px solid ${selected.accent}88`,
                                        borderRadius: 0,
                                        color: 'rgba(255,255,255,0.7)',
                                        fontFamily: 'Poppins, sans-serif',
                                        fontSize: 12,
                                        letterSpacing: '0.1em',
                                        padding: '8px 12px',
                                        maxWidth: '100%',
                                        width: 220,
                                        outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option style={{ background: '#1a1a2e' }}>Standard (1-2 hours)</option>
                                    <option style={{ background: '#1a1a2e' }}>Quick (30 min)</option>
                                    <option style={{ background: '#1a1a2e' }}>Extended (3+ hours)</option>
                                </select>
                            </div>
                        </div>

                        {/* Error */}
                        {localError && (
                            <div style={{
                                background: 'rgba(139,0,0,0.3)',
                                border: '1px solid rgba(204,34,0,0.4)',
                                borderRadius: 4,
                                padding: '8px 14px',
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: 12,
                                color: '#ff6666',
                                maxWidth: 320,
                            }}>
                                {localError}
                                <button
                                    onClick={() => setLocalError('')}
                                    style={{ marginLeft: 10, background: 'none', border: 'none', color: '#ff9999', cursor: 'pointer', fontSize: 10, textDecoration: 'underline' }}
                                >
                                    clear
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── BOTTOM BAR (character thumbnails + nav + confirm) ── */}
                <div style={{
                    position: 'relative', zIndex: 20,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(12px)',
                    padding: '16px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    marginTop: 24,
                }}>
                    {/* Return action */}
                    <button
                        onClick={() => router.visit('/dashboard')}
                        className="bottom-action-label opacity-70 hover:opacity-100"
                        style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1.5px solid rgba(255,255,255,0.15)',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontFamily: 'inherit'
                        }}
                    >
                        <span className="action-icon" style={{ borderColor: 'currentColor', color: 'rgba(255,255,255,0.6)' }}>&lt;</span>
                        <span style={{ color: '#fff' }}>BACK TO DASHBOARD</span>
                    </button>

                    {/* Thumbnails strip */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button className="nav-btn" onClick={cycleLeft}>‹</button>

                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            {genres.map((genre) => (
                                <GenreThumbnail
                                    key={genre.id}
                                    genre={genre}
                                    isSelected={genre.id === selectedGenreId}
                                    onClick={() => setSelectedGenreId(genre.id)}
                                />
                            ))}
                        </div>

                        <button className="nav-btn" onClick={cycleRight}>›</button>
                    </div>

                    {/* Confirm action */}
                    <button
                        className="confirm-btn"
                        onClick={handleStartGame}
                        disabled={!characterName || loading}
                        style={{
                            background: loading
                                ? 'rgba(255,255,255,0.1)'
                                : `linear-gradient(135deg, ${selected.accent}cc, ${selected.accent})`,
                            color: selectedGenreId === 'fantasy' ? '#1a0e00' : '#fff',
                            boxShadow: !loading && characterName ? `0 4px 24px ${selected.accentGlow}` : 'none',
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <i className="fas fa-spinner fa-spin" />
                                CREATING...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                CONFIRM
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}