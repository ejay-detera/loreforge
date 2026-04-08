import React from 'react';

/* ─── Genre-specific themes ──────────────────────────────────────────── */
const GENRE_THEMES = {
    fantasy: {
        // Rich forest + ancient ruins feel
        background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, #3B1F6E 0%, #1A0A3A 35%, #0D2010 65%, #0A1A0D 100%)
        `,
        // Animated shimmer layers
        shimmer: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(201,168,76,0.18) 0%, transparent 60%),
                  radial-gradient(ellipse 40% 60% at 70% 60%, rgba(45,122,79,0.15) 0%, transparent 60%)`,
        groundGradient: 'linear-gradient(180deg, #0D2010 0%, #071009 100%)',
        skyGradient: 'linear-gradient(180deg, #1A0A3A 0%, #2D1B69 50%, #0D2010 100%)',
        fogColor: 'rgba(201,168,76,0.06)',
        accentColor: '#C9A84C',
        accentGlow: 'rgba(201, 168, 76, 0.5)',
        buttonPrimary: 'linear-gradient(135deg, #7B3F00 0%, #C9A84C 50%, #5A1A00 100%)',
        buttonHover: 'linear-gradient(135deg, #8B4500 0%, #E8C96A 50%, #6B2000 100%)',
        buttonSecondary: 'linear-gradient(135deg, #2D7A4F 0%, #1F4F2A 100%)',
        hpBarColor: '#2D7A4F',
        hpBarGlow: 'rgba(45,122,79,0.8)',
        mpBarColor: '#6A0DAD',
        mpBarGlow: 'rgba(106,13,173,0.8)',
        enemyHpBarColor: '#CC2200',
        enemyHpBarGlow: 'rgba(204,34,0,0.8)',
        borderColor: 'rgba(201, 168, 76, 0.4)',
        cardBg: 'rgba(10, 4, 25, 0.82)',
        textAccent: '#C9A84C',
        particleColors: ['#C9A84C', '#FFD700', '#8B4513', '#2D7A4F'],
        stars: true,
        starColor: 'rgba(255,220,120,0.6)',
        groundColor: 'rgba(13,32,16,0.9)',
    },
    horror: {
        background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, #1A0005 0%, #0A0008 35%, #0D0808 65%, #050303 100%)
        `,
        shimmer: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(139,0,0,0.20) 0%, transparent 60%),
                  radial-gradient(ellipse 40% 60% at 70% 60%, rgba(80,0,80,0.12) 0%, transparent 60%)`,
        groundGradient: 'linear-gradient(180deg, #0D0808 0%, #050303 100%)',
        skyGradient: 'linear-gradient(180deg, #0A0005 0%, #1A0010 50%, #0D0808 100%)',
        fogColor: 'rgba(139,0,0,0.08)',
        accentColor: '#8B0000',
        accentGlow: 'rgba(139, 0, 0, 0.5)',
        buttonPrimary: 'linear-gradient(135deg, #5A0000 0%, #8B0000 50%, #3A0000 100%)',
        buttonHover: 'linear-gradient(135deg, #7A0000 0%, #CC2200 50%, #5A0000 100%)',
        buttonSecondary: 'linear-gradient(135deg, #4A0020 0%, #8B0000 100%)',
        hpBarColor: '#CC2200',
        hpBarGlow: 'rgba(204,34,0,0.8)',
        mpBarColor: '#4A007C',
        mpBarGlow: 'rgba(74,0,124,0.8)',
        enemyHpBarColor: '#4A7C1A',
        enemyHpBarGlow: 'rgba(74,124,26,0.8)',
        borderColor: 'rgba(139, 0, 0, 0.45)',
        cardBg: 'rgba(8, 0, 3, 0.88)',
        textAccent: '#FF3333',
        particleColors: ['#8B0000', '#FF0000', '#4A0080', '#CC0000'],
        stars: false,
        groundColor: 'rgba(13,8,8,0.95)',
    },
    scifi: {
        background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, #000820 0%, #000A1A 35%, #00101A 65%, #000508 100%)
        `,
        shimmer: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(0,191,255,0.15) 0%, transparent 60%),
                  radial-gradient(ellipse 40% 60% at 70% 60%, rgba(0,80,255,0.12) 0%, transparent 60%)`,
        groundGradient: 'linear-gradient(180deg, #00101A 0%, #000508 100%)',
        skyGradient: 'linear-gradient(180deg, #000010 0%, #000A2A 50%, #001020 100%)',
        fogColor: 'rgba(0,191,255,0.06)',
        accentColor: '#00BFFF',
        accentGlow: 'rgba(0, 191, 255, 0.45)',
        buttonPrimary: 'linear-gradient(135deg, #003A5C 0%, #00BFFF 50%, #001A3A 100%)',
        buttonHover: 'linear-gradient(135deg, #004A7C 0%, #40D4FF 50%, #002A5A 100%)',
        buttonSecondary: 'linear-gradient(135deg, #00CED1 0%, #0080FF 100%)',
        hpBarColor: '#00CED1',
        hpBarGlow: 'rgba(0,206,209,0.8)',
        mpBarColor: '#0080FF',
        mpBarGlow: 'rgba(0,128,255,0.8)',
        enemyHpBarColor: '#FF6600',
        enemyHpBarGlow: 'rgba(255,102,0,0.8)',
        borderColor: 'rgba(0, 191, 255, 0.35)',
        cardBg: 'rgba(0, 4, 16, 0.88)',
        textAccent: '#00BFFF',
        particleColors: ['#00BFFF', '#00CED1', '#0080FF', '#40D4FF'],
        stars: true,
        starColor: 'rgba(100,200,255,0.7)',
        groundColor: 'rgba(0,12,20,0.95)',
    },
};

/* ─── Stars (fantasy + scifi only) ───────────────────────────────────── */
const StarField = ({ genre }) => {
    const theme = GENRE_THEMES[genre] || GENRE_THEMES.fantasy;
    if (!theme.stars) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        width: i % 5 === 0 ? '3px' : '2px',
                        height: i % 5 === 0 ? '3px' : '2px',
                        left: `${(i * 2.5 + (i % 7) * 3.1) % 100}%`,
                        top: `${(i * 3.7 + (i % 5) * 4.2) % 55}%`,
                        backgroundColor: theme.starColor,
                        animationDelay: `${(i * 0.3) % 4}s`,
                        animationDuration: `${2 + (i % 4)}s`,
                        opacity: 0.4 + (i % 5) * 0.12,
                    }}
                />
            ))}
        </div>
    );
};

/* ─── Floating ambient particles ─────────────────────────────────────── */
const GenreParticles = ({ genre }) => {
    const theme = GENRE_THEMES[genre] || GENRE_THEMES.fantasy;
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full animate-pulse"
                    style={{
                        width: '2px',
                        height: '2px',
                        left: `${(i * 8.3 + 5) % 100}%`,
                        top: `${(i * 9.1 + 10) % 90}%`,
                        backgroundColor: theme.particleColors[i % theme.particleColors.length],
                        opacity: 0.4 + (i % 3) * 0.15,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: `${3 + i % 3}s`,
                    }}
                />
            ))}
        </div>
    );
};

/* ─── Ground divider line ────────────────────────────────────────────── */
const GroundLine = ({ genre }) => {
    const theme = GENRE_THEMES[genre] || GENRE_THEMES.fantasy;
    return (
        <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
                bottom: '38%',
                height: '2px',
                background: `linear-gradient(90deg, transparent 0%, ${theme.accentColor}55 20%, ${theme.accentColor}88 50%, ${theme.accentColor}55 80%, transparent 100%)`,
                boxShadow: `0 0 12px ${theme.accentGlow}`,
            }}
        />
    );
};

/* ─── Genre Container ────────────────────────────────────────────────── */
const GenreContainer = ({ genre = 'fantasy', children, className = '' }) => {
    const key = (genre || 'fantasy').toLowerCase();
    const theme = GENRE_THEMES[key] || GENRE_THEMES.fantasy;

    return (
        <div
            className={`relative flex-1 min-h-0 w-full text-white overflow-hidden flex flex-col ${className}`}
            style={{ background: theme.background }}
        >
            {/* Shimmer overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{ background: theme.shimmer }}
            />
            {/* Stars (fantasy/scifi) */}
            <StarField genre={key} />
            {/* Ambient particles */}
            <GenreParticles genre={key} />
            {/* Ground line */}
            <GroundLine genre={key} />
            {/* Fog bottom glow */}
            <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none"
                style={{
                    height: '120px',
                    background: `linear-gradient(0deg, ${theme.fogColor} 0%, transparent 100%)`,
                    zIndex: 1,
                }}
            />
            {/* Content */}
            <div className="relative z-10 flex flex-col flex-1">
                {children}
            </div>
        </div>
    );
};

/* ─── Genre Button ───────────────────────────────────────────────────── */
export const GenreButton = ({
    genre = 'fantasy',
    variant = 'primary',
    children,
    onClick,
    disabled = false,
    className = '',
    size = 'medium',
    icon = null,
}) => {
    const key = (genre || 'fantasy').toLowerCase();
    const theme = GENRE_THEMES[key] || GENRE_THEMES.fantasy;

    const sizes = {
        small:  'px-3 py-1.5 text-xs',
        medium: 'px-5 py-2.5 text-sm',
        large:  'px-8 py-4 text-base',
    };

    const variants = {
        primary: {
            bg:     theme.buttonPrimary,
            hover:  theme.buttonHover,
            color:  '#ffffff',
            shadow: `0 4px 18px ${theme.accentGlow}`,
            border: `1px solid ${theme.accentColor}55`,
        },
        secondary: {
            bg:     theme.buttonSecondary,
            hover:  theme.buttonPrimary,
            color:  '#ffffff',
            shadow: `0 4px 14px ${theme.accentGlow}`,
            border: 'none',
        },
        outline: {
            bg:     'transparent',
            hover:  theme.buttonPrimary,
            color:  theme.accentColor,
            shadow: 'none',
            border: `1.5px solid ${theme.accentColor}`,
        },
    };

    const v = variants[variant] || variants.primary;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative overflow-hidden rounded-lg font-bold tracking-wide
                transition-all duration-200 transform
                hover:scale-[1.03] active:scale-[0.97]
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                ${sizes[size] || sizes.medium}
                ${className}
            `}
            style={{
                background: v.bg,
                color: v.color,
                border: v.border,
                boxShadow: v.shadow,
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg; }}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
};

/* ─── Genre Card ─────────────────────────────────────────────────────── */
export const GenreCard = ({ genre = 'fantasy', children, className = '' }) => {
    const key = (genre || 'fantasy').toLowerCase();
    const theme = GENRE_THEMES[key] || GENRE_THEMES.fantasy;

    return (
        <div
            className={`rounded-xl border backdrop-blur-md ${className}`}
            style={{
                background: theme.cardBg,
                borderColor: theme.borderColor,
                boxShadow: `0 6px 28px ${theme.accentGlow}`,
            }}
        >
            {children}
        </div>
    );
};

/* ─── Genre Stat Bar ─────────────────────────────────────────────────── */
export const GenreStatBar = ({ genre = 'fantasy', value, max, type = 'hp' }) => {
    const key = (genre || 'fantasy').toLowerCase();
    const theme = GENRE_THEMES[key] || GENRE_THEMES.fantasy;

    const colorMap = {
        hp:      { color: theme.hpBarColor,      glow: theme.hpBarGlow },
        mp:      { color: theme.mpBarColor,       glow: theme.mpBarGlow },
        enemyHp: { color: theme.enemyHpBarColor,  glow: theme.enemyHpBarGlow },
    };

    const { color, glow } = colorMap[type] || colorMap.hp;
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

    // Color shifts to yellow/red as HP gets low
    let barColor = color;
    if (type === 'hp' && pct <= 25) barColor = '#CC2200';
    else if (type === 'hp' && pct <= 50) barColor = '#CC8800';

    return (
        <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden"
             style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                    width: `${pct}%`,
                    backgroundColor: barColor,
                    boxShadow: `0 0 8px ${glow}`,
                }}
            />
        </div>
    );
};

export const getGenreTheme = (genre) =>
    GENRE_THEMES[(genre || 'fantasy').toLowerCase()] || GENRE_THEMES.fantasy;

export default GenreContainer;