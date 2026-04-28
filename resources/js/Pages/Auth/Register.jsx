import { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';


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

export default function Register({ auth, captcha_img, status, isBlocked }) {



    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [captchaSrc, setCaptchaSrc] = useState(captcha_img);

    useEffect(() => {
        setCaptchaSrc(captcha_img);
    }, [captcha_img]);



    
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        captcha: '',
    });


    // Password strength checker
    const checkPasswordStrength = (password) => {
        const criteria = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        
        setPasswordCriteria(criteria);
        
        const metCriteria = Object.values(criteria).filter(Boolean).length;
        setPasswordStrength(metCriteria);
        
        return metCriteria;
    };

    // Get password strength text and color
    const getPasswordStrengthInfo = () => {
        switch (passwordStrength) {
            case 0:
                return { text: 'Very Weak', color: 'text-red-500', bgColor: 'bg-red-500/20', width: 'w-1/5' };
            case 1:
                return { text: 'Weak', color: 'text-red-400', bgColor: 'bg-red-400/20', width: 'w-2/5' };
            case 2:
                return { text: 'Moderately Weak', color: 'text-orange-400', bgColor: 'bg-orange-400/20', width: 'w-3/5' };
            case 3:
                return { text: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', width: 'w-4/5' };
            case 4:
                return { text: 'Strong', color: 'text-blue-400', bgColor: 'bg-blue-400/20', width: 'w-4/5' };
            case 5:
                return { text: 'Very Strong', color: 'text-green-400', bgColor: 'bg-green-400/20', width: 'w-full' };
            default:
                return { text: '', color: '', bgColor: '', width: 'w-0' };
        }
    };

    // Check if password meets all criteria
    const isPasswordStrongEnough = passwordStrength === 5;

    // Handle password change
    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setData('password', password);
        checkPasswordStrength(password);
    };

    const refreshCaptcha = () => {
        router.reload({ only: ['captcha_img'] });
    };




    const submit = (e) => {
        e.preventDefault();
        
        if (!isPasswordStrongEnough) {
            return;
        }
        
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />
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
                            <Link href={route('login')} className="block px-4 py-2 text-sm font-medium text-text-primary-off-white hover:bg-surface-dark-charcoal rounded-lg transition-colors duration-300">
                                <i className="fas fa-sign-in-alt mr-2"></i>Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-20">
                <div className="w-full max-w-6xl">
                    <div className="bg-surface-dark-charcoal/80 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden border border-border-subtle-dark/50 shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
                            {/* Left Panel - Registration Form */}
                            <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                                <div className="transition-all duration-300 opacity-100 scale-100">
                                    {/* Logo */}
                                    <div className="text-center mb-6 md:mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent-emerald-green to-accent-hover-lighter-green rounded-2xl mb-4 md:mb-6 transform hover:scale-110 transition-transform duration-300">
                                            <i className="fas fa-dragon text-2xl md:text-3xl text-white"></i>
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary-off-white mb-2 md:mb-3">
                                            Join LoreForge
                                        </h1>
                                        <p className="text-sm md:text-lg text-text-muted-cool-gray px-2">
                                            Create your account and start your adventure
                                        </p>
                                    </div>

                                    {status && (
                                        <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg text-sm border ${
                                            isBlocked 
                                                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                                                : 'bg-accent-emerald-green/20 border-accent-emerald-green/50 text-accent-emerald-green'
                                        }`}>
                                            <i className={`fas ${isBlocked ? 'fa-lock' : 'fa-info-circle'} mr-2`}></i>
                                            {status}
                                        </div>
                                    )}

                                    <form onSubmit={submit}>

                                        <div className="mb-4 md:mb-6">
                                            <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="Enter your username"
                                                required
                                                disabled={isBlocked}
                                            />
                                            {errors.username && (
                                                <div className="mt-2 text-sm text-red-400">{errors.username}</div>
                                            )}
                                        </div>

                                        <div className="mb-4 md:mb-6">
                                            <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="Enter your email"
                                                autoComplete="username"
                                                required
                                                disabled={isBlocked}
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
                                                onChange={handlePasswordChange}
                                                className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="Enter your password"
                                                autoComplete="new-password"
                                                required
                                                disabled={isBlocked}
                                            />
                                            {errors.password && (
                                                <div className="mt-2 text-sm text-red-400">{errors.password}</div>
                                            )}
                                            
                                            {/* Password Strength Indicator */}
                                            {data.password && (
                                                <div className="mt-3 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-text-muted-cool-gray">Password Strength</span>
                                                        <span className={`text-xs font-medium ${getPasswordStrengthInfo().color}`}>
                                                            {getPasswordStrengthInfo().text}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-border-subtle-dark rounded-full h-2 overflow-hidden">
                                                        <div 
                                                            className={`h-full ${getPasswordStrengthInfo().bgColor} transition-all duration-300 ease-out`}
                                                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    
                                                    <div className="mt-3 space-y-1">
                                                        {[
                                                            { key: 'length', label: 'At least 8 characters' },
                                                            { key: 'uppercase', label: 'One uppercase letter' },
                                                            { key: 'lowercase', label: 'One lowercase letter' },
                                                            { key: 'number', label: 'One number' },
                                                            { key: 'special', label: 'One special character (!@#$%^&* etc.)' },
                                                        ].map(({ key, label }) => (
                                                            <div key={key} className="flex items-center text-xs">
                                                                <i className={`fas fa-check-circle mr-2 ${passwordCriteria[key] ? 'text-green-400' : 'text-text-muted-cool-gray'}`}></i>
                                                                <span className={passwordCriteria[key] ? 'text-green-400' : 'text-text-muted-cool-gray'}>
                                                                    {label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    {!isPasswordStrongEnough && data.password && (
                                                        <div className="mt-3 p-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                                                            <p className="text-xs text-orange-400">
                                                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                                                Password must meet all criteria to continue
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-4 md:mb-6">
                                            <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder="Confirm your password"
                                                autoComplete="new-password"
                                                required
                                                disabled={isBlocked}
                                            />
                                            {errors.password_confirmation && (
                                                <div className="mt-2 text-sm text-red-400">{errors.password_confirmation}</div>
                                            )}
                                        </div>

                                        {!isBlocked && (
                                            <div className="mb-6 md:mb-8">
                                                <label className="block text-sm font-medium text-text-primary-off-white mb-2 flex items-center justify-between">
                                                    <span>Security Check</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="bg-white rounded p-1">
                                                            <img 
                                                                src={captchaSrc} 
                                                                alt="captcha" 
                                                                className="h-8 w-auto rounded"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={refreshCaptcha}
                                                            className="p-2 text-accent-emerald-green hover:text-accent-hover-lighter-green transition-colors"
                                                            title="Refresh Captcha"
                                                        >
                                                            <i className="fas fa-sync-alt text-xs"></i>
                                                        </button>
                                                    </div>
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted-cool-gray">
                                                        <i className="fas fa-robot text-xs"></i>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={data.captcha}
                                                        onChange={(e) => setData('captcha', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300"
                                                        placeholder="Enter the result"
                                                        required
                                                    />
                                                </div>
                                                {errors.captcha && (
                                                    <div className="mt-2 text-sm text-red-400">{errors.captcha}</div>
                                                )}
                                            </div>
                                        )}



                                        <button
                                            type="submit"
                                            disabled={processing || !isPasswordStrongEnough || isBlocked}
                                            className={`w-full py-3 md:py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isBlocked
                                                    ? 'bg-red-600 text-white cursor-not-allowed'
                                                    : !isPasswordStrongEnough && data.password
                                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-accent-emerald-green to-accent-hover-lighter-green text-white hover:shadow-lg hover:shadow-accent-emerald-green/30'
                                            }`}
                                        >
                                            {processing ? (
                                                <span className="flex items-center justify-center">
                                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                                    Creating account...
                                                </span>
                                            ) : isBlocked ? (
                                                <span className="flex items-center justify-center">
                                                    <i className="fas fa-lock mr-2"></i>
                                                    Access Restricted
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <i className="fas fa-user-plus mr-2"></i>
                                                    {!isPasswordStrongEnough && data.password ? 'Password Too Weak' : 'Sign Up'}
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Right Panel - Desktop only */}
                            <div className="relative bg-gradient-to-br from-surface-dark-charcoal to-bg-deep-navy hidden lg:block">
                                <img
                                    src="/images/signup-image.webp"
                                    alt="Sign up illustration"
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-deep-navy via-transparent to-bg-deep-navy/50"></div>
                                
                                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
                                    <div className="text-center">
                                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                                            Start Your Journey
                                        </h2>
                                        <p className="text-lg md:text-xl text-text-primary-off-white/90 max-w-md mx-auto">
                                            Join thousands of players in epic adventures
                                        </p>
                                    </div>
                                    
                                    <div className="text-center">
                                        <Link
                                            href={route('login')}
                                            className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-highlight-warm-gold to-yellow-500 text-bg-deep-navy font-bold rounded-xl md:rounded-2xl hover:shadow-xl hover:shadow-highlight-warm-gold/30 transition-all duration-300 hover:scale-105 transform inline-flex items-center"
                                        >
                                            <i className="fas fa-sign-in-alt mr-2 md:mr-3 group-hover:animate-bounce"></i>
                                            Sign In Instead
                                        </Link>
                                        <p className="mt-2 md:mt-4 text-text-muted-cool-gray text-xs md:text-sm">
                                            Already have an account?
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Toggle Button */}
                            <div className="lg:hidden p-6 bg-surface-dark-charcoal/50 border-t border-border-subtle-dark/50">
                                <div className="text-center">
                                    <Link
                                        href={route('login')}
                                        className="group w-full px-6 py-3 bg-gradient-to-r from-highlight-warm-gold to-yellow-500 text-bg-deep-navy font-bold rounded-xl hover:shadow-xl hover:shadow-highlight-warm-gold/30 transition-all duration-300 hover:scale-105 transform inline-flex items-center justify-center"
                                    >
                                        <i className="fas fa-sign-in-alt mr-2 group-hover:animate-bounce"></i>
                                        Sign In Instead
                                    </Link>
                                    <p className="mt-2 text-text-muted-cool-gray text-xs">
                                        Already have an account?
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
