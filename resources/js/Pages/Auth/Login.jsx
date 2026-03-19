import { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

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

export default function Login({ status, canResetPassword }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { props } = usePage();
    const { message, type } = props;
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />
            <div className="font-sans antialiased bg-bg-deep-navy text-text-primary-off-white min-h-screen overflow-x-hidden relative">
                <ConstellationBackground />

                {/* Home Button */}
                <div className="fixed z-20 top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8">
                    <Link href="/" className="inline-flex items-center group">
                        <div className="relative">
                            <i className="fas fa-dragon text-xl sm:text-2xl text-accent-emerald-green mr-2 transform group-hover:scale-110 transition-transform duration-300"></i>
                            <div className="absolute -inset-1 bg-accent-emerald-green/20 rounded-full blur-sm group-hover:opacity-75 transition-opacity duration-300"></div>
                        </div>
                        <div className="hidden sm:block text-xl sm:text-2xl font-bold text-accent-emerald-green group-hover:text-accent-hover-lighter-green transition-colors duration-300">
                            LOREFORGE
                        </div>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="fixed z-20 top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 lg:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg text-text-primary-off-white bg-surface-dark-charcoal/80 backdrop-blur-lg border border-border-subtle-dark/50 hover:bg-surface-dark-charcoal transition-colors duration-300"
                    >
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                    </button>
                </div>

                {/* Mobile Dropdown */}
                <div className={`fixed z-20 top-16 sm:top-20 right-4 sm:right-6 md:right-8 lg:hidden transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
                }`}>
                    <div className="bg-surface-dark-charcoal/95 backdrop-blur-lg border border-border-subtle-dark/50 rounded-lg shadow-xl min-w-[200px]">
                        <div className="py-2">
                            <Link href="/" className="block px-4 py-2 text-sm font-medium text-text-primary-off-white hover:bg-surface-dark-charcoal rounded-lg transition-colors duration-300">
                                <i className="fas fa-home mr-2"></i>Home
                            </Link>
                            <Link href={route('register')} className="block px-4 py-2 text-sm font-medium text-text-primary-off-white hover:bg-surface-dark-charcoal rounded-lg transition-colors duration-300">
                                <i className="fas fa-user-plus mr-2"></i>Create Account
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-20">
                <div className="w-full max-w-6xl">
                    <div className="bg-surface-dark-charcoal/80 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden border border-border-subtle-dark/50 shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
                            {/* Left Panel - Login Form */}
                            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                                <div className="transition-all duration-300 opacity-100 scale-100">
                                    {/* Logo */}
                                    <div className="text-center mb-6 md:mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent-emerald-green to-accent-hover-lighter-green rounded-2xl mb-4 md:mb-6 transform hover:scale-110 transition-transform duration-300">
                                            <i className="fas fa-dragon text-2xl md:text-3xl text-white"></i>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary-off-white mb-2 md:mb-3">
                                            Welcome Back
                                        </h1>
                                        <p className="text-sm md:text-lg text-text-muted-cool-gray px-2">
                                            Enter your credentials to access your account
                                        </p>
                                    </div>

                                    {status && (
                                        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-accent-emerald-green/20 border border-accent-emerald-green/50 rounded-lg text-sm text-accent-emerald-green">
                                            {status}
                                        </div>
                                    )}

                                    {message && (
                                        <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg text-sm ${
                                            type === 'warning' 
                                                ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' 
                                                : 'bg-accent-emerald-green/20 border border-accent-emerald-green/50 text-accent-emerald-green'
                                        }`}>
                                            {message}
                                        </div>
                                    )}

                                    <form onSubmit={submit}>
                                        <div className="mb-4 md:mb-6">
                                            <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300"
                                                placeholder="Enter your email"
                                                autoComplete="username"
                                                required
                                            />
                                            {errors.email && (
                                                <div className="mt-2 text-sm text-red-400">{errors.email}</div>
                                            )}
                                        </div>

                                        <div className="mb-4 md:mb-6">
                                            <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300"
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                required
                                            />
                                            {errors.password && (
                                                <div className="mt-2 text-sm text-red-400">{errors.password}</div>
                                            )}
                                        </div>

                                        <div className="mb-4 md:mb-6">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.remember}
                                                    onChange={(e) => setData('remember', e.target.checked)}
                                                    className="w-4 h-4 bg-bg-deep-navy border-border-subtle-dark rounded focus:ring-accent-emerald-green/20 focus:border-accent-emerald-green"
                                                />
                                                <span className="ml-2 text-sm text-text-muted-cool-gray">
                                                    Remember me
                                                </span>
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full py-3 md:py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-accent-emerald-green to-accent-hover-lighter-green text-white hover:shadow-lg hover:shadow-accent-emerald-green/30"
                                        >
                                            {processing ? (
                                                <span className="flex items-center justify-center">
                                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                                    Signing in...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <i className="fas fa-sign-in-alt mr-2"></i>
                                                    Sign In
                                                </span>
                                            )}
                                        </button>
                                    </form>

                                    {canResetPassword && (
                                        <div className="mt-4 md:mt-6 text-center">
                                            <Link
                                                href={route('password.request')}
                                                className="text-text-muted-cool-gray hover:text-accent-emerald-green transition-colors duration-300 text-sm"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel - Desktop only */}
                            <div className="relative bg-gradient-to-br from-surface-dark-charcoal to-bg-deep-navy hidden lg:block">
                                <img
                                    src="/images/login-image.webp"
                                    alt="Login illustration"
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-deep-navy via-transparent to-bg-deep-navy/50"></div>
                                
                                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                                            Welcome Back
                                        </h2>
                                        <p className="text-lg md:text-xl text-text-primary-off-white/90 max-w-md mx-auto">
                                            Continue your adventure where you left off
                                        </p>
                                    </div>
                                    
                                    <div className="text-center">
                                        <Link
                                            href={route('register')}
                                            className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-highlight-warm-gold to-yellow-500 text-bg-deep-navy font-bold rounded-xl md:rounded-2xl hover:shadow-xl hover:shadow-highlight-warm-gold/30 transition-all duration-300 hover:scale-105 transform inline-flex items-center"
                                        >
                                            <i className="fas fa-user-plus mr-2 md:mr-3 group-hover:animate-bounce"></i>
                                            Create Account
                                        </Link>
                                        <p className="mt-2 md:mt-4 text-text-muted-cool-gray text-xs md:text-sm">
                                            Don't have an account yet?
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Toggle Button */}
                            <div className="lg:hidden p-6 bg-surface-dark-charcoal/50 border-t border-border-subtle-dark/50">
                                <div className="text-center">
                                    <Link
                                        href={route('register')}
                                        className="group w-full px-6 py-3 bg-gradient-to-r from-highlight-warm-gold to-yellow-500 text-bg-deep-navy font-bold rounded-xl hover:shadow-xl hover:shadow-highlight-warm-gold/30 transition-all duration-300 hover:scale-105 transform inline-flex items-center justify-center"
                                    >
                                        <i className="fas fa-user-plus mr-2 group-hover:animate-bounce"></i>
                                        Create Account
                                    </Link>
                                    <p className="mt-2 text-text-muted-cool-gray text-xs">
                                        Don't have an account yet?
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}