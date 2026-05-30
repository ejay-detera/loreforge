import React, { useEffect, useRef } from 'react';

/* ─── Genre-specific themes ──────────────────────────────────────────── */
const GENRE_THEMES = {
    fantasy: {
        background: `
            radial-gradient(ellipse 95% 55% at 50% 0%, rgba(201,168,76,0.18) 0%, transparent 62%),
            radial-gradient(ellipse 65% 45% at 14% 24%, rgba(106,13,173,0.28) 0%, transparent 70%),
            radial-gradient(ellipse 70% 50% at 88% 28%, rgba(45,122,79,0.24) 0%, transparent 72%),
            linear-gradient(180deg, #2A124C 0%, #122A1F 58%, #06100A 100%)
        `,
        shimmer: `linear-gradient(120deg, transparent 0%, rgba(201,168,76,0.06) 36%, transparent 68%),
                  radial-gradient(ellipse 80% 50% at 50% 78%, rgba(45,122,79,0.14) 0%, transparent 72%)`,
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
            radial-gradient(ellipse 110% 58% at 50% -8%, rgba(0,191,255,0.2) 0%, transparent 62%),
            linear-gradient(115deg, transparent 0%, rgba(0,128,255,0.08) 42%, transparent 68%),
            radial-gradient(ellipse 72% 50% at 82% 34%, rgba(0,206,209,0.14) 0%, transparent 72%),
            linear-gradient(180deg, #020714 0%, #031526 52%, #001019 100%)
        `,
        shimmer: `linear-gradient(90deg, transparent 0%, rgba(0,191,255,0.08) 48%, transparent 100%),
                  radial-gradient(ellipse 80% 45% at 50% 80%, rgba(0,206,209,0.12) 0%, transparent 70%)`,
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

/* ═══════════════════════════════════════════════════════════════════════
   FANTASY ANIMATIONS
   - Twinkling stars
   - Floating fireflies (golden orbs)
   - Drifting leaves
   - Swaying distant trees (silhouette)
   - Aurora shimmer across sky
═══════════════════════════════════════════════════════════════════════ */

const FantasyStars = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <style>{`
            @keyframes twinkle {
                0%, 100% { opacity: 0.2; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.4); }
            }
            @keyframes shootingStar {
                0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 1; width: 2px; }
                100% { transform: translateX(300px) translateY(120px) rotate(-35deg); opacity: 0; width: 80px; }
            }
            @keyframes aurora {
                0%   { opacity: 0.08; transform: scaleX(1) translateY(0px); }
                33%  { opacity: 0.18; transform: scaleX(1.08) translateY(-6px); }
                66%  { opacity: 0.12; transform: scaleX(0.95) translateY(4px); }
                100% { opacity: 0.08; transform: scaleX(1) translateY(0px); }
            }
        `}</style>

        {/* Aurora bands */}
        {[
            { top: '5%', color: 'rgba(106,13,173,0.22)', delay: '0s', dur: '7s', width: '70%', left: '15%' },
            { top: '12%', color: 'rgba(45,122,79,0.18)', delay: '2s', dur: '9s', width: '55%', left: '25%' },
            { top: '8%', color: 'rgba(201,168,76,0.12)', delay: '4s', dur: '11s', width: '40%', left: '30%' },
        ].map((a, i) => (
            <div key={i} className="absolute rounded-full" style={{
                top: a.top, left: a.left, width: a.width, height: '60px',
                background: `radial-gradient(ellipse, ${a.color} 0%, transparent 70%)`,
                animation: `aurora ${a.dur} ease-in-out infinite`,
                animationDelay: a.delay,
                filter: 'blur(8px)',
            }} />
        ))}

        {/* Stars */}
        {[...Array(55)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
                width: i % 7 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1.5px',
                height: i % 7 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1.5px',
                left: `${(i * 1.82 + (i % 11) * 2.7) % 100}%`,
                top: `${(i * 2.3 + (i % 7) * 3.1) % 55}%`,
                backgroundColor: i % 5 === 0 ? 'rgba(255,220,120,0.9)' : 'rgba(220,210,255,0.8)',
                animation: `twinkle ${2 + (i % 5)}s ease-in-out infinite`,
                animationDelay: `${(i * 0.23) % 5}s`,
            }} />
        ))}

        {/* Shooting stars */}
        {[
            { top: '8%', left: '10%', delay: '3s', dur: '1.2s', interval: '8s' },
            { top: '18%', left: '50%', delay: '9s', dur: '0.9s', interval: '13s' },
            { top: '5%', left: '70%', delay: '15s', dur: '1s', interval: '18s' },
        ].map((s, i) => (
            <div key={i} className="absolute rounded-full" style={{
                top: s.top, left: s.left,
                width: '2px', height: '2px',
                backgroundColor: 'rgba(255,240,180,0.95)',
                boxShadow: '0 0 6px 1px rgba(255,220,100,0.6)',
                animation: `shootingStar ${s.dur} ease-out infinite`,
                animationDelay: s.delay,
            }} />
        ))}
    </div>
);

const FantasyFireflies = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <style>{`
            @keyframes firefly1 {
                0%   { transform: translate(0px, 0px);    opacity: 0; }
                15%  { opacity: 0.9; }
                50%  { transform: translate(40px, -30px); opacity: 0.5; }
                80%  { opacity: 0.8; }
                100% { transform: translate(-20px, 20px); opacity: 0; }
            }
            @keyframes firefly2 {
                0%   { transform: translate(0, 0);        opacity: 0; }
                20%  { opacity: 1; }
                45%  { transform: translate(-35px, -25px); }
                70%  { transform: translate(15px, -40px); opacity: 0.6; }
                100% { transform: translate(25px, 10px);  opacity: 0; }
            }
            @keyframes firefly3 {
                0%   { transform: translate(0, 0);   opacity: 0; }
                25%  { opacity: 0.85; }
                60%  { transform: translate(30px, 20px); opacity: 0.4; }
                100% { transform: translate(-10px, -15px); opacity: 0; }
            }
            @keyframes fireflyPulse {
                0%, 100% { box-shadow: 0 0 4px 2px rgba(201,168,76,0.6); }
                50%       { box-shadow: 0 0 10px 4px rgba(201,220,76,0.9); }
            }
        `}</style>
        {[
            { bottom: '35%', left: '12%', anim: 'firefly1', dur: '6s', delay: '0s' },
            { bottom: '50%', left: '22%', anim: 'firefly2', dur: '8s', delay: '1.5s' },
            { bottom: '42%', left: '35%', anim: 'firefly3', dur: '7s', delay: '0.8s' },
            { bottom: '38%', left: '55%', anim: 'firefly1', dur: '9s', delay: '2.2s' },
            { bottom: '55%', left: '65%', anim: 'firefly2', dur: '5s', delay: '3.5s' },
            { bottom: '45%', left: '78%', anim: 'firefly3', dur: '7.5s', delay: '1.2s' },
            { bottom: '60%', left: '45%', anim: 'firefly1', dur: '10s', delay: '4s' },
            { bottom: '32%', left: '88%', anim: 'firefly2', dur: '6.5s', delay: '2.8s' },
            { bottom: '48%', left: '5%', anim: 'firefly3', dur: '8.5s', delay: '0.3s' },
            { bottom: '65%', left: '30%', anim: 'firefly1', dur: '7s', delay: '5s' },
            { bottom: '40%', left: '92%', anim: 'firefly2', dur: '9s', delay: '1.8s' },
            { bottom: '70%', left: '58%', anim: 'firefly3', dur: '6s', delay: '3.1s' },
        ].map((f, i) => (
            <div key={i} className="absolute rounded-full" style={{
                bottom: f.bottom, left: f.left,
                width: '4px', height: '4px',
                backgroundColor: '#D4E840',
                borderRadius: '50%',
                animation: `${f.anim} ${f.dur} ease-in-out infinite, fireflyPulse 1.5s ease-in-out infinite`,
                animationDelay: f.delay,
            }} />
        ))}
    </div>
);

const FantasyLeaves = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <style>{`
            @keyframes leafFall1 {
                0%   { transform: translateX(0)    translateY(-20px) rotate(0deg);   opacity: 0; }
                10%  { opacity: 0.85; }
                90%  { opacity: 0.7; }
                100% { transform: translateX(60px) translateY(110vh)  rotate(360deg); opacity: 0; }
            }
            @keyframes leafFall2 {
                0%   { transform: translateX(0)     translateY(-20px) rotate(0deg);    opacity: 0; }
                10%  { opacity: 0.75; }
                100% { transform: translateX(-80px) translateY(110vh)  rotate(-270deg); opacity: 0; }
            }
            @keyframes leafFall3 {
                0%   { transform: translateX(0)    translateY(-20px) rotate(20deg);  opacity: 0; }
                15%  { opacity: 0.9; }
                100% { transform: translateX(40px) translateY(110vh)  rotate(300deg); opacity: 0; }
            }
            @keyframes leafSway {
                0%, 100% { margin-left: 0; }
                25%       { margin-left: 15px; }
                75%       { margin-left: -15px; }
            }
        `}</style>
        {[
            /* leaf shape as a tiny inline SVG via clip */
            { left: '5%', delay: '0s', dur: '9s', anim: 'leafFall1', color: '#2D7A4F', size: 10 },
            { left: '15%', delay: '2s', dur: '11s', anim: 'leafFall2', color: '#4A9A2F', size: 8 },
            { left: '28%', delay: '4.5s', dur: '8s', anim: 'leafFall3', color: '#C9A84C', size: 9 },
            { left: '40%', delay: '1s', dur: '13s', anim: 'leafFall1', color: '#2D7A4F', size: 7 },
            { left: '55%', delay: '6s', dur: '10s', anim: 'leafFall2', color: '#5AA830', size: 11 },
            { left: '68%', delay: '3s', dur: '9.5s', anim: 'leafFall3', color: '#C9A84C', size: 8 },
            { left: '80%', delay: '7s', dur: '12s', anim: 'leafFall1', color: '#3A9A4F', size: 9 },
            { left: '92%', delay: '0.5s', dur: '8.5s', anim: 'leafFall2', color: '#C9A84C', size: 7 },
            { left: '72%', delay: '5s', dur: '10s', anim: 'leafFall3', color: '#2D7A4F', size: 10 },
            { left: '8%', delay: '8s', dur: '11s', anim: 'leafFall1', color: '#4A9A2F', size: 8 },
        ].map((l, i) => (
            <div key={i} style={{
                position: 'absolute', top: '-20px', left: l.left,
                width: `${l.size}px`, height: `${l.size * 0.7}px`,
                backgroundColor: l.color,
                borderRadius: '50% 10% 50% 10%',
                animation: `${l.anim} ${l.dur} ease-in-out infinite, leafSway 3s ease-in-out infinite`,
                animationDelay: l.delay,
                opacity: 0,
                boxShadow: `0 0 3px ${l.color}88`,
            }} />
        ))}
    </div>
);

const FantasyTrees = () => (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '35%', zIndex: 2 }}>
        <style>{`
            @keyframes treeSway {
                0%, 100% { transform-origin: bottom center; transform: rotate(0deg); }
                30%       { transform-origin: bottom center; transform: rotate(1.2deg); }
                70%       { transform-origin: bottom center; transform: rotate(-0.8deg); }
            }
            @keyframes treeSway2 {
                0%, 100% { transform-origin: bottom center; transform: rotate(0deg); }
                40%       { transform-origin: bottom center; transform: rotate(-1.5deg); }
                80%       { transform-origin: bottom center; transform: rotate(1deg); }
            }
            @keyframes mistDrift {
                0%   { transform: translateX(0)    scaleX(1);    opacity: 0.12; }
                50%  { transform: translateX(30px) scaleX(1.1);  opacity: 0.22; }
                100% { transform: translateX(0)    scaleX(1);    opacity: 0.12; }
            }
        `}</style>
        <svg width="100%" height="100%" viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax meet">
            {/* Mist layer */}
            <ellipse cx="600" cy="280" rx="700" ry="40" fill="rgba(45,122,79,0.08)" style={{ animation: 'mistDrift 8s ease-in-out infinite' }} />
            <ellipse cx="400" cy="290" rx="500" ry="30" fill="rgba(201,168,76,0.05)" style={{ animation: 'mistDrift 11s ease-in-out infinite', animationDelay: '3s' }} />

            {/* Back row — shorter, more transparent */}
            {[60, 180, 320, 480, 640, 800, 940, 1080].map((x, i) => (
                <g key={i} style={{ animation: `treeSway${(i % 2) + 1} ${6 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.7}s` }}>
                    <polygon points={`${x},300 ${x - 30},170 ${x + 30},170`} fill="rgba(8,24,14,0.6)" />
                    <polygon points={`${x},210 ${x - 24},100 ${x + 24},100`} fill="rgba(11,30,16,0.55)" />
                    <polygon points={`${x},140 ${x - 18},60  ${x + 18},60`} fill="rgba(16,40,20,0.5)" />
                </g>
            ))}
            {/* Front row — taller, more opaque */}
            {[-20, 110, 260, 410, 550, 700, 850, 1000, 1150, 1220].map((x, i) => (
                <g key={i} style={{ animation: `treeSway${(i % 2) + 1} ${7 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.5 + 1}s` }}>
                    <polygon points={`${x},310 ${x - 40},140 ${x + 40},140`} fill="rgba(4,12,6,0.95)" />
                    <polygon points={`${x},190 ${x - 32},70  ${x + 32},70`} fill="rgba(6,18,8,0.9)" />
                    <polygon points={`${x},110 ${x - 24},20  ${x + 24},20`} fill="rgba(9,24,11,0.85)" />
                </g>
            ))}
        </svg>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   HORROR ANIMATIONS
   - Red lightning strikes
   - Blood drip particles
   - Pulsing fog
   - Flickering vignette
═══════════════════════════════════════════════════════════════════════ */

const HorrorLightning = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        let animId;
        let nextStrike = Date.now() + Math.random() * 2000 + 800;

        const drawBolt = (x1, y1, x2, y2, spread, depth) => {
            if (depth === 0) return;
            const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
            const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread * 0.3;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(mx, my);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            // Branches
            if (depth > 1 && Math.random() > 0.5) {
                const bx = mx + (Math.random() - 0.5) * spread * 2;
                const by = my + Math.random() * spread;
                ctx.beginPath();
                ctx.moveTo(mx, my);
                ctx.lineTo(bx, by);
                ctx.stroke();
            }
            drawBolt(x1, y1, mx, my, spread / 2, depth - 1);
            drawBolt(mx, my, x2, y2, spread / 2, depth - 1);
        };

        const strike = () => {
            const startX = Math.random() * canvas.width;
            const endX = startX + (Math.random() - 0.5) * 120;
            const endY = canvas.height * (0.3 + Math.random() * 0.4);

            // Main bright flash
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(255, 30, 30, 0.95)';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 18;
            drawBolt(startX, 0, endX, endY, 60, 5);

            // Glow pass
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
            ctx.lineWidth = 6;
            ctx.shadowBlur = 40;
            drawBolt(startX, 0, endX, endY, 60, 3);

            // White core
            ctx.strokeStyle = 'rgba(255, 200, 200, 0.9)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 8;
            drawBolt(startX, 0, endX, endY, 60, 4);

            // Fade out
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Sometimes a second flicker
                if (Math.random() > 0.5) {
                    setTimeout(() => {
                        ctx.strokeStyle = 'rgba(200,20,20,0.5)';
                        ctx.lineWidth = 1.5;
                        ctx.shadowBlur = 12;
                        drawBolt(startX, 0, endX, endY, 50, 4);
                        setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 80);
                    }, 100);
                }
            }, 150);
        };

        const loop = () => {
            const now = Date.now();
            if (now >= nextStrike) {
                strike();
                nextStrike = now + Math.random() * 3000 + 1000;
            }
            animId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', zIndex: 3 }}
        />
    );
};

const HorrorAtmosphere = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <style>{`
            @keyframes screenFlicker {
                0%, 92%, 96%, 100% { opacity: 0; }
                93%, 95%           { opacity: 0.06; }
            }
            @keyframes fogPulse {
                0%, 100% { opacity: 0.12; transform: scaleX(1); }
                50%       { opacity: 0.25; transform: scaleX(1.05); }
            }
            @keyframes vignetteBreath {
                0%, 100% { opacity: 0.55; }
                50%       { opacity: 0.75; }
            }
        `}</style>

        {/* Flickering red vignette */}
        <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(80,0,0,0.5) 100%)',
            animation: 'screenFlicker 6s ease-in-out infinite',
        }} />

        {/* Breathing dark vignette */}
        <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(40,0,0,0.55) 100%)',
            animation: 'vignetteBreath 5s ease-in-out infinite',
        }} />

        {/* Ground fog layers */}
        {[0, 1, 2].map(i => (
            <div key={i} style={{
                position: 'absolute', bottom: `${i * 8}%`, left: 0, right: 0,
                height: '80px',
                background: `linear-gradient(0deg, rgba(60,0,0,${0.18 - i * 0.04}) 0%, transparent 100%)`,
                animation: `fogPulse ${5 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 1.5}s`,
                filter: 'blur(4px)',
            }} />
        ))}
    </div>
);

const HorrorEyes = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <style>{`
            @keyframes eyeBlink {
                0%, 88%, 100% { transform: scaleY(1); opacity: 0.7; }
                90%, 98%      { transform: scaleY(0.05); opacity: 0.3; }
            }
            @keyframes eyeAppear {
                0%, 60%  { opacity: 0; }
                65%, 90% { opacity: 1; }
                100%     { opacity: 0; }
            }
            @keyframes eyePupilDrift {
                0%   { transform: translate(0px, 0px); }
                25%  { transform: translate(2px, 1px); }
                50%  { transform: translate(-2px, 0px); }
                75%  { transform: translate(1px, -1px); }
                100% { transform: translate(0px, 0px); }
            }
        `}</style>
        {[
            { left: '8%', top: '55%', delay: '2s', dur: '12s' },
            { left: '88%', top: '48%', delay: '6s', dur: '15s' },
            { left: '45%', top: '60%', delay: '10s', dur: '18s' },
        ].map((e, i) => (
            <div key={i} style={{
                position: 'absolute', left: e.left, top: e.top,
                display: 'flex', gap: '8px',
                animation: `eyeAppear ${e.dur} ease-in-out infinite`,
                animationDelay: e.delay,
                opacity: 0,
            }}>
                {[0, 1].map(j => (
                    <div key={j} style={{
                        width: '16px', height: '10px',
                        backgroundColor: '#CC0000',
                        borderRadius: '50%',
                        boxShadow: '0 0 8px 3px rgba(200,0,0,0.8)',
                        animation: `eyeBlink 4s ease-in-out infinite`,
                        animationDelay: `${j * 0.05}s`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{
                            width: '6px', height: '6px',
                            backgroundColor: '#1A0000',
                            borderRadius: '50%',
                            animation: `eyePupilDrift 3s ease-in-out infinite`,
                        }} />
                    </div>
                ))}
            </div>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   SCI-FI ANIMATIONS
   - Laser beams sweeping across
   - Scrolling grid / hex pattern
   - Data stream particles
   - Holographic scan lines
═══════════════════════════════════════════════════════════════════════ */

const ScifiGrid = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <style>{`
            @keyframes gridScroll {
                0%   { transform: perspective(500px) rotateX(60deg) translateY(0px); }
                100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
            }
            @keyframes gridFade {
                0%, 100% { opacity: 0.15; }
                50%       { opacity: 0.35; filter: drop-shadow(0 0 4px rgba(0,191,255,0.6)); }
            }
        `}</style>
        <div style={{
            position: 'absolute', bottom: '-24%', left: '-30%', right: '-30%', height: '70%',
            backgroundImage: `
                linear-gradient(rgba(0,191,255,0.26) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,191,255,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
            animation: 'gridScroll 4s linear infinite, gridFade 3s ease-in-out infinite',
            transformOrigin: 'bottom center',
        }} />
    </div>
);

const ScifiLasers = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
        resize();
        window.addEventListener('resize', resize);

        const lasers = [];
        const colors = ['rgba(0,191,255,', 'rgba(0,255,200,', 'rgba(100,150,255,', 'rgba(0,230,255,'];

        class Laser {
            constructor() { this.reset(); }
            reset() {
                this.fromLeft = Math.random() > 0.5;
                this.y = Math.random() * canvas.height * 0.7;
                this.x = this.fromLeft ? -20 : canvas.width + 20;
                this.targetX = this.fromLeft ? canvas.width + 20 : -20;
                this.speed = 3 + Math.random() * 4;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.width = 1 + Math.random() * 1.5;
                this.length = 60 + Math.random() * 120;
                this.opacity = 0.22 + Math.random() * 0.28;
                this.alive = true;
            }
            update() {
                this.x += this.fromLeft ? this.speed : -this.speed;
                if (this.fromLeft ? this.x > canvas.width + this.length : this.x < -this.length) this.alive = false;
            }
            draw() {
                const tail = this.fromLeft ? this.x - this.length : this.x + this.length;
                const grad = ctx.createLinearGradient(tail, this.y, this.x, this.y);
                grad.addColorStop(0, `${this.color}0)`);
                grad.addColorStop(0.4, `${this.color}${this.opacity})`);
                grad.addColorStop(1, `${this.color}${this.opacity})`);
                ctx.beginPath();
                ctx.moveTo(tail, this.y);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = grad;
                ctx.lineWidth = this.width;
                ctx.shadowColor = this.color + '0.8)';
                ctx.shadowBlur = 8;
                ctx.stroke();
                // bright core
                const grad2 = ctx.createLinearGradient(tail, this.y, this.x, this.y);
                grad2.addColorStop(0, `rgba(255,255,255,0)`);
                grad2.addColorStop(1, `rgba(255,255,255,0.8)`);
                ctx.beginPath();
                ctx.moveTo(tail, this.y);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = grad2;
                ctx.lineWidth = this.width * 0.4;
                ctx.shadowBlur = 4;
                ctx.stroke();
            }
        }

        let nextSpawn = Date.now() + 600;
        let animId;

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const now = Date.now();
            if (now >= nextSpawn && lasers.length < 4) {
                lasers.push(new Laser());
                nextSpawn = now + 900 + Math.random() * 1700;
            }
            for (let i = lasers.length - 1; i >= 0; i--) {
                lasers[i].update();
                lasers[i].draw();
                if (!lasers[i].alive) lasers.splice(i, 1);
            }
            animId = requestAnimationFrame(loop);
        };
        loop();

        return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
    }, []);

    return (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', zIndex: 3 }} />
    );
};

const ScifiDataStream = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <style>{`
            @keyframes dataFall {
                0%   { transform: translateY(-100%); opacity: 0; }
                10%  { opacity: 0.8; }
                90%  { opacity: 0.6; }
                100% { transform: translateY(120vh);  opacity: 0; }
            }
            @keyframes scanLine {
                0%   { top: -2px; opacity: 0.12; }
                100% { top: 100%; opacity: 0.04; }
            }
            @keyframes hexPulse {
                0%, 100% { opacity: 0.04; }
                50%       { opacity: 0.12; }
            }
        `}</style>

        {/* Matrix-style data columns */}
        {[3, 12, 22, 35, 48, 58, 70, 82, 93].map((left, i) => (
            <div key={i} style={{
                position: 'absolute', top: 0, left: `${left}%`,
                fontSize: '9px', fontFamily: 'monospace',
                color: i % 3 === 0 ? 'rgba(0,255,200,0.28)' : 'rgba(0,191,255,0.24)',
                lineHeight: '14px', letterSpacing: '0px',
                animation: `dataFall ${5 + i * 0.8}s linear infinite`,
                animationDelay: `${i * 0.7}s`,
                whiteSpace: 'nowrap',
                writingMode: 'vertical-lr',
                userSelect: 'none',
            }}>
                {['01', 'FF', 'A3', '7B', '2E', 'C9', '00', 'FE', '11', 'D4', '8A', '3C'][i % 12]}
                {['10', '0F', 'B1', '4A', 'E2', '99', 'CC', '55', 'AA', '66', '33', '77'][i % 12]}
                {['11', 'AB', '22', 'BC', '5F', '0D', '8E', '13', 'F9', '42', '6B', 'D8'][i % 12]}
            </div>
        ))}

        {/* Scan line */}
        <div style={{
            position: 'absolute', left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0,191,255,0.15), transparent)',
            animation: 'scanLine 4s linear infinite',
        }} />

        {/* Corner HUD brackets */}
        {[
            { top: 8, left: 8, borderTop: '2px solid', borderLeft: '2px solid' },
            { top: 8, right: 8, borderTop: '2px solid', borderRight: '2px solid' },
            { bottom: 8, left: 8, borderBottom: '2px solid', borderLeft: '2px solid' },
            { bottom: 8, right: 8, borderBottom: '2px solid', borderRight: '2px solid' },
        ].map((s, i) => (
            <div key={i} style={{
                position: 'absolute', ...s,
                width: '20px', height: '20px',
                borderColor: 'rgba(0,191,255,0.4)',
                opacity: 0.45,
            }} />
        ))}
    </div>
);

const ScifiStars = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <style>{`
            @keyframes starPulse {
                0%, 100% { opacity: 0.3; }
                50%       { opacity: 1; }
            }
            @keyframes meteorShot {
                0%   { transform: translateX(0) translateY(0) rotate(-25deg); opacity: 1; width: 2px; }
                100% { transform: translateX(350px) translateY(80px) rotate(-25deg); opacity: 0; width: 100px; }
            }
        `}</style>
        {[...Array(60)].map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
                width: i % 9 === 0 ? '3px' : '1.5px',
                height: i % 9 === 0 ? '3px' : '1.5px',
                left: `${(i * 1.65 + (i % 13) * 2.4) % 100}%`,
                top: `${(i * 2.1 + (i % 9) * 3.3) % 55}%`,
                backgroundColor: i % 6 === 0 ? 'rgba(0,230,255,0.9)' : 'rgba(180,220,255,0.7)',
                animation: `starPulse ${2 + (i % 6)}s ease-in-out infinite`,
                animationDelay: `${(i * 0.18) % 5}s`,
            }} />
        ))}
        {/* Meteors */}
        {[
            { top: '10%', left: '5%', delay: '2s', dur: '1s' },
            { top: '25%', left: '40%', delay: '7s', dur: '0.8s' },
            { top: '5%', left: '65%', delay: '14s', dur: '1.1s' },
        ].map((m, i) => (
            <div key={i} className="absolute" style={{
                top: m.top, left: m.left,
                width: '2px', height: '2px',
                backgroundColor: 'rgba(0,230,255,0.95)',
                boxShadow: '0 0 6px 2px rgba(0,191,255,0.5)',
                animation: `meteorShot ${m.dur} linear infinite`,
                animationDelay: m.delay,
            }} />
        ))}
    </div>
);

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
            <div className="absolute inset-0 pointer-events-none z-0" style={{ background: theme.shimmer }} />

            {/* ── GENRE-SPECIFIC LAYERS ── */}
            {key === 'fantasy' && (
                <>
                    <FantasyStars />
                    <FantasyFireflies />
                    <FantasyLeaves />
                    <FantasyTrees />
                </>
            )}
            {key === 'horror' && (
                <>
                    <HorrorLightning />
                    <HorrorAtmosphere />
                    <HorrorEyes />
                </>
            )}
            {key === 'scifi' && (
                <>
                    <ScifiStars />
                    <ScifiGrid />
                    <ScifiLasers />
                    <ScifiDataStream />
                </>
            )}

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
        small: 'px-3 py-1.5 text-xs',
        medium: 'px-5 py-2.5 text-sm',
        large: 'px-8 py-4 text-base',
    };

    const variants = {
        primary: {
            bg: theme.buttonPrimary,
            hover: theme.buttonHover,
            color: '#ffffff',
            shadow: `0 4px 18px ${theme.accentGlow}`,
            border: `1px solid ${theme.accentColor}55`,
        },
        secondary: {
            bg: theme.buttonSecondary,
            hover: theme.buttonPrimary,
            color: '#ffffff',
            shadow: `0 4px 14px ${theme.accentGlow}`,
            border: 'none',
        },
        outline: {
            bg: 'transparent',
            hover: theme.buttonPrimary,
            color: theme.accentColor,
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
                relative overflow-hidden rounded-lg font-bold tracking-normal
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
        hp: { color: theme.hpBarColor, glow: theme.hpBarGlow },
        mp: { color: theme.mpBarColor, glow: theme.mpBarGlow },
        enemyHp: { color: theme.enemyHpBarColor, glow: theme.enemyHpBarGlow },
    };

    const { color, glow } = colorMap[type] || colorMap.hp;
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

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


/* ─── Genre Platform ─────────────────────────────────────────────────── */
export const GenrePlatform = ({ genre = 'fantasy', className = '', style = {} }) => {
    const key = (genre || 'fantasy').toLowerCase();
    const theme = getGenreTheme(key);

    return (
        <div className={`relative ${className}`} style={{ width: '220px', height: '80px', ...style }}>
            <style>{`
                @keyframes platformRotate {
                    from { transform: rotateX(65deg) rotateZ(0deg); }
                    to { transform: rotateX(65deg) rotateZ(360deg); }
                }
                @keyframes hexFlicker {
                    0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 10px ${theme.accentColor}); }
                    50% { opacity: 0.9; filter: drop-shadow(0 0 25px ${theme.accentColor}); }
                }
                @keyframes bloodPulse {
                    0%, 100% { transform: scale(1) rotateX(65deg); opacity: 0.85; }
                    50% { transform: scale(1.04) rotateX(65deg); opacity: 1; }
                }
                @keyframes voidMorph {
                    0%, 100% { border-radius: 45% 55% 40% 60% / 55% 45% 65% 35%; }
                    33% { border-radius: 50% 50% 30% 70% / 45% 55% 40% 60%; }
                    66% { border-radius: 40% 60% 50% 50% / 60% 40% 55% 45%; }
                }
                @keyframes mistDrift {
                    0%, 100% { transform: rotateX(65deg) scale(1.2) translate(0, 0); opacity: 0.3; }
                    50% { transform: rotateX(65deg) scale(1.3) translate(5px, -5px); opacity: 0.5; }
                }
            `}</style>

            {key === 'fantasy' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <style>{`
                        @keyframes runeRotate {
                            from { transform: rotateX(65deg) rotateZ(0deg); }
                            to { transform: rotateX(65deg) rotateZ(360deg); }
                        }
                    `}</style>

                    {/* Solid Base */}
                    <div className="absolute inset-[-15%] rounded-full opacity-70"
                        style={{
                            background: `radial-gradient(circle, ${theme.accentColor}88 0%, ${theme.accentColor}33 60%, transparent 85%)`,
                            transform: 'rotateX(65deg)',
                            border: `2px solid ${theme.accentColor}55`,
                            boxShadow: `inset 0 0 20px ${theme.accentColor}44`
                        }} />

                    {/* Runic Ring */}
                    <div className="absolute w-full h-full animate-[runeRotate_20s_linear_infinite]"
                        style={{ transformStyle: 'preserve-3d' }}>
                        {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'].map((rune, i) => {
                            const angle = (i * 360) / 24;
                            return (
                                <div
                                    key={i}
                                    className="absolute left-1/2 top-1/2 text-xs font-bold"
                                    style={{
                                        color: theme.accentColor,
                                        textShadow: `0 0 5px ${theme.accentColor}`,
                                        transform: `rotateZ(${angle}deg) translateY(-85px) rotateX(-90deg)`,
                                        transformOrigin: 'center center',
                                    }}
                                >
                                    {rune}
                                </div>
                            );
                        })}
                    </div>

                    {/* Outer Rings */}
                    <div className="absolute inset-0 rounded-full border border-double opacity-60 animate-[platformRotate_15s_linear_infinite_reverse]"
                        style={{ borderColor: theme.accentColor }} />
                    <div className="absolute inset-0 rounded-full border border-dashed opacity-40 animate-[platformRotate_30s_linear_infinite]"
                        style={{ borderColor: theme.accentColor }} />
                    <div className="absolute inset-0 rounded-full border border-dashed opacity-40 animate-[platformRotate_30s_linear_infinite_reverse]"
                        style={{ borderColor: theme.accentColor }} />
                    <div className="absolute inset-0 rounded-full border border-dashed opacity-40 animate-[platformRotate_45s_linear_infinite]"
                        style={{ borderColor: theme.accentColor }} />
                    {/* Inner Glow */}
                    <div className="absolute inset-[-25%] rounded-full blur-3xl animate-pulse opacity-50"
                        style={{ background: `radial-gradient(circle, ${theme.accentColor} 0%, transparent 70%)`, transform: 'rotateX(65deg)' }} />
                </div>
            )}

            {key === 'horror' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <style>{`
                        @keyframes bloodPulse {
                            0%, 100% { opacity: 0.85; transform: rotateX(70deg) scale(1); }
                            50% { opacity: 1; transform: rotateX(70deg) scale(1.04); }
                        }
                        @keyframes ripple1 {
                            0% { transform: rotateX(70deg) scale(0.6); opacity: 0.6; }
                            100% { transform: rotateX(70deg) scale(1.35); opacity: 0; }
                        }
                        @keyframes ripple2 {
                            0% { transform: rotateX(70deg) scale(0.6); opacity: 0.5; }
                            100% { transform: rotateX(70deg) scale(1.35); opacity: 0; }
                        }
                        @keyframes ripple3 {
                            0% { transform: rotateX(70deg) scale(0.6); opacity: 0.4; }
                            100% { transform: rotateX(70deg) scale(1.35); opacity: 0; }
                        }
                        @keyframes specShimmer {
                            0%, 100% { opacity: 0.12; transform: rotateX(70deg) translate(-15%, -20%) scale(1); }
                            40% { opacity: 0.28; transform: rotateX(70deg) translate(-12%, -22%) scale(1.1); }
                            70% { opacity: 0.08; transform: rotateX(70deg) translate(-18%, -18%) scale(0.9); }
                        }
                        @keyframes rimBreath {
                            0%, 100% { opacity: 0.3; transform: rotateX(70deg) scale(1); }
                            50% { opacity: 0.6; transform: rotateX(70deg) scale(1.02); }
                        }
                        @keyframes outerGlowPulse {
                            0%, 100% { opacity: 0.7; }
                            50% { opacity: 1; }
                        }
                        @keyframes mistDrift {
                            0%, 100% { transform: rotateX(70deg) scale(1) translateY(0px); opacity: 0.5; }
                            33% { transform: rotateX(70deg) scale(1.06) translateY(-2px); opacity: 0.7; }
                            66% { transform: rotateX(70deg) scale(0.97) translateY(1px); opacity: 0.45; }
                        }
                    `}</style>

                    {/* Outer glow ring — slow pulse */}
                    <div className="absolute"
                        style={{
                            width: '160%',
                            height: '160%',
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(139,0,0,0.45) 75%, transparent 100%)',
                            transform: 'rotateX(70deg)',
                            animation: 'outerGlowPulse 3s ease-in-out infinite',
                        }}
                    />

                    {/* Ripple 1 — slowest, outermost */}
                    <div className="absolute"
                        style={{
                            width: '130%',
                            height: '130%',
                            borderRadius: '50%',
                            border: '1.5px solid rgba(139,0,0,0.55)',
                            transform: 'rotateX(70deg) scale(0.6)',
                            animation: 'ripple1 3.2s ease-out infinite',
                            animationDelay: '0s',
                        }}
                    />

                    {/* Ripple 2 */}
                    <div className="absolute"
                        style={{
                            width: '130%',
                            height: '130%',
                            borderRadius: '50%',
                            border: '1px solid rgba(160,0,0,0.45)',
                            transform: 'rotateX(70deg) scale(0.6)',
                            animation: 'ripple2 3.2s ease-out infinite',
                            animationDelay: '1.07s',
                        }}
                    />

                    {/* Ripple 3 */}
                    <div className="absolute"
                        style={{
                            width: '130%',
                            height: '130%',
                            borderRadius: '50%',
                            border: '1px solid rgba(180,0,0,0.35)',
                            transform: 'rotateX(70deg) scale(0.6)',
                            animation: 'ripple3 3.2s ease-out infinite',
                            animationDelay: '2.14s',
                        }}
                    />

                    {/* Main blood pool — gentle breathe */}
                    <div className="absolute"
                        style={{
                            width: '120%',
                            height: '120%',
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse at 50% 40%, #3a0000 0%, #150000 45%, #000 100%)',
                            transform: 'rotateX(70deg)',
                            boxShadow: '0 0 24px 6px rgba(139,0,0,0.3), inset 0 0 20px rgba(0,0,0,0.9)',
                            animation: 'bloodPulse 4s ease-in-out infinite',
                        }}
                    />

                    {/* Inner crimson mist — drifts slowly */}
                    <div className="absolute"
                        style={{
                            width: '70%',
                            height: '55%',
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse at 45% 35%, rgba(200,0,0,0.22) 0%, transparent 70%)',
                            transform: 'rotateX(70deg)',
                            animation: 'mistDrift 5s ease-in-out infinite',
                        }}
                    />

                    {/* Specular highlight — shimmer */}
                    <div className="absolute"
                        style={{
                            width: '28%',
                            height: '22%',
                            borderRadius: '50%',
                            background: 'radial-gradient(ellipse, rgba(255,40,40,0.14) 0%, transparent 100%)',
                            transform: 'rotateX(70deg) translate(-15%, -20%)',
                            animation: 'specShimmer 2.8s ease-in-out infinite',
                        }}
                    />

                    {/* Dashed rim — breathes */}
                    <div className="absolute"
                        style={{
                            width: '122%',
                            height: '122%',
                            borderRadius: '50%',
                            border: '1px dashed rgba(139,0,0,0.3)',
                            transform: 'rotateX(70deg)',
                            animation: 'rimBreath 4s ease-in-out infinite',
                            animationDelay: '0.5s',
                        }}
                    />
                </div>
            )}

            {key === 'scifi' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Hex grid disc surface */}
                    <div className="absolute inset-[-15%] opacity-90"
                        style={{
                            background: `radial-gradient(ellipse, ${theme.accentColor}33 0%, ${theme.accentColor}08 70%, transparent 90%)`,
                            border: `2px solid ${theme.accentColor}`,
                            borderRadius: '50%',
                            transform: 'rotateX(65deg)',
                            boxShadow: `0 0 50px ${theme.accentColor}55, 0 0 20px ${theme.accentColor}44 inset`,
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24'%3E%3Cpolygon points='14,2 24,8 24,16 14,22 4,16 4,8' fill='none' stroke='%2300e5ff' stroke-width='0.4' opacity='0.35'/%3E%3C/svg%3E")`,
                            backgroundBlendMode: 'screen',
                        }} />

                    {/* Inner rim ring */}
                    <div className="absolute inset-6 border border-cyan-400/40 rounded-full"
                        style={{ transform: 'rotateX(65deg)' }} />

                    {/* Pulsing core glow */}
                    <div className="absolute rounded-full animate-pulse"
                        style={{
                            width: '30%', height: '12%',
                            background: `radial-gradient(ellipse, ${theme.accentColor}99 0%, transparent 70%)`,
                            transform: 'rotateX(65deg)',
                            filter: 'blur(6px)',
                        }} />

                    {/* Rising particles */}
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="absolute rounded-full"
                            style={{
                                width: i % 2 === 0 ? '6px' : '4px',
                                height: i % 2 === 0 ? '6px' : '4px',
                                background: theme.accentColor,
                                left: `${42 + i * 5}%`,
                                bottom: '48%',
                                opacity: 0,
                                animation: `rise 2.4s ease-in infinite ${i * 0.6}s`,
                                boxShadow: `0 0 6px ${theme.accentColor}`,
                            }} />
                    ))}

                    {/* HUD label */}
                    <div className="absolute bottom-[28%] text-[9px] tracking-[4px] font-mono opacity-40"
                        style={{ color: theme.accentColor }}>
                        FIELD:STABLE
                    </div>

                    <style>{`
                @keyframes rise {
                    0%   { opacity: 0; transform: translateY(0); }
                    20%  { opacity: 0.8; }
                    100% { opacity: 0; transform: translateY(-70px); }
                }
                `}</style>
                </div>
            )}
        </div>
    );
};

export const getGenreTheme = (genre) =>
    GENRE_THEMES[(genre || 'fantasy').toLowerCase()] || GENRE_THEMES.fantasy;

export default GenreContainer;
