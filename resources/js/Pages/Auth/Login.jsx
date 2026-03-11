import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordCriteria, setPasswordCriteria] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        name: '',
        password_confirmation: '',
        remember: false,
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
        if (!isLogin) {
            checkPasswordStrength(password);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (isLogin) {
            post(route('login'), {
                onFinish: () => reset('password'),
            });
        } else {
            if (!isPasswordStrongEnough) {
                return;
            }
            post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
        }
    };

    const toggleMode = () => {
        setIsAnimating(true);
        setIsMobileMenuOpen(false);
        setTimeout(() => {
            setIsLogin(!isLogin);
            setIsAnimating(false);
            setPasswordStrength(0);
            setPasswordCriteria({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false,
            });
        }, 300);
    };

    return (
        <>
            <Head title={isLogin ? "Login" : "Sign Up"} />
            <div className="min-h-screen bg-bg-deep-navy flex relative overflow-hidden">
                {/* Animated Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-bg-deep-navy via-surface-dark-charcoal to-bg-deep-navy"></div>
                    <div className="absolute inset-0">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-pulse"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${3 + Math.random() * 4}s`
                                }}
                            >
                                <div className="w-1 h-1 bg-accent-emerald-green rounded-full opacity-30"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Home Button — fixed top-left */}
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

                {/* Mobile Menu Button — fixed top-right */}
                <div className="fixed z-20 top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 lg:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg text-text-primary-off-white bg-surface-dark-charcoal/80 backdrop-blur-lg border border-border-subtle-dark/50 hover:bg-surface-dark-charcoal transition-colors duration-300"
                    >
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                    </button>
                </div>

                {/* Mobile Dropdown Menu — fixed, anchored to top-right */}
                <div
                    className={`fixed z-20 top-16 sm:top-20 right-4 sm:right-6 md:right-8 lg:hidden transition-all duration-300 ${
                        isMobileMenuOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
                    }`}
                >
                    <div className="bg-surface-dark-charcoal/95 backdrop-blur-lg border border-border-subtle-dark/50 rounded-lg shadow-xl min-w-[200px]">
                        <div className="py-2">
                            <Link
                                href="/"
                                className="block px-4 py-2 text-sm font-medium text-text-primary-off-white hover:bg-surface-dark-charcoal rounded-lg transition-colors duration-300"
                            >
                                <i className="fas fa-home mr-2"></i>
                                Home
                            </Link>
                            <button
                                onClick={toggleMode}
                                className="w-full text-left px-4 py-2 text-sm font-medium text-text-primary-off-white hover:bg-surface-dark-charcoal rounded-lg transition-colors duration-300"
                            >
                                <i className={`fas fa-${isLogin ? 'user-plus' : 'sign-in-alt'} mr-2`}></i>
                                {isLogin ? 'Create Account' : 'Sign In Instead'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-20">
                    <div className="w-full max-w-6xl">
                        <div className="bg-surface-dark-charcoal/80 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden border border-border-subtle-dark/50 shadow-2xl">
                            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
                                
                                {/* Left Panel - Form */}
                                <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                                    <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                                        {/* Logo */}
                                        <div className="text-center mb-6 md:mb-8">
                                            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent-emerald-green to-accent-hover-lighter-green rounded-2xl mb-4 md:mb-6 transform hover:scale-110 transition-transform duration-300">
                                                <i className="fas fa-dragon text-2xl md:text-3xl text-white"></i>
                                            </div>
                                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary-off-white mb-2 md:mb-3">
                                                {isLogin ? 'Welcome Back' : 'Join LoreForge'}
                                            </h1>
                                            <p className="text-sm md:text-lg text-text-muted-cool-gray px-2">
                                                {isLogin ? 'Enter your credentials to access your account' : 'Create your account and start your adventure'}
                                            </p>
                                        </div>

                                        {status && (
                                            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-accent-emerald-green/20 border border-accent-emerald-green/50 rounded-lg text-sm text-accent-emerald-green">
                                                {status}
                                            </div>
                                        )}

                                        <form onSubmit={submit}>
                                            {!isLogin && (
                                                <div className="mb-4 md:mb-6">
                                                    <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                                        Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300"
                                                        placeholder="Enter your name"
                                                        required
                                                    />
                                                    {errors.name && (
                                                        <div className="mt-2 text-sm text-red-400">{errors.name}</div>
                                                    )}
                                                </div>
                                            )}

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
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300"
                                                    placeholder="Enter your password"
                                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                                    required
                                                />
                                                {errors.password && (
                                                    <div className="mt-2 text-sm text-red-400">{errors.password}</div>
                                                )}
                                                
                                                {/* Password Strength Indicator - Only show in signup mode */}
                                                {!isLogin && data.password && (
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

                                            {!isLogin && (
                                                <div className="mb-4 md:mb-6">
                                                    <label className="block text-sm font-medium text-text-primary-off-white mb-2">
                                                        Confirm Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className="w-full px-3 md:px-4 py-3 bg-bg-deep-navy border border-border-subtle-dark rounded-lg text-text-primary-off-white placeholder-text-muted-cool-gray focus:border-accent-emerald-green focus:ring-2 focus:ring-accent-emerald-green/20 transition-all duration-300"
                                                        placeholder="Confirm your password"
                                                        autoComplete="new-password"
                                                        required
                                                    />
                                                    {errors.password_confirmation && (
                                                        <div className="mt-2 text-sm text-red-400">{errors.password_confirmation}</div>
                                                    )}
                                                </div>
                                            )}

                                            {isLogin && (
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
                                            )}

                                            <button
                                                type="submit"
                                                disabled={processing || (!isLogin && !isPasswordStrongEnough)}
                                                className={`w-full py-3 md:py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                    !isLogin && !isPasswordStrongEnough && data.password
                                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-accent-emerald-green to-accent-hover-lighter-green text-white hover:shadow-lg hover:shadow-accent-emerald-green/30'
                                                }`}
                                            >
                                                {processing ? (
                                                    <span className="flex items-center justify-center">
                                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                                        {isLogin ? 'Signing in...' : 'Creating account...'}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center">
                                                        <i className="fas fa-sign-in-alt mr-2"></i>
                                                        {isLogin ? 'Sign In' : !isPasswordStrongEnough && data.password ? 'Password Too Weak' : 'Sign Up'}
                                                    </span>
                                                )}
                                            </button>
                                        </form>

                                        {isLogin && canResetPassword && (
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
                                        src={isLogin ? "/images/login-image.webp" : "/images/signup-image.webp"}
                                        alt={isLogin ? "Login illustration" : "Sign up illustration"}
                                        className="w-full h-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-bg-deep-navy via-transparent to-bg-deep-navy/50"></div>
                                    
                                    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
                                        <div className="text-center">
                                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                                                {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                                            </h2>
                                            <p className="text-lg md:text-xl text-text-primary-off-white/90 max-w-md mx-auto">
                                                {isLogin 
                                                    ? 'Continue your adventure where you left off'
                                                    : 'Join thousands of players in epic adventures'
                                                }
                                            </p>
                                        </div>
                                        
                                        <div className="text-center">
                                            <button
                                                onClick={toggleMode}
                                                className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-highlight-warm-gold to-yellow-500 text-bg-deep-navy font-bold rounded-xl md:rounded-2xl hover:shadow-xl hover:shadow-highlight-warm-gold/30 transition-all duration-300 hover:scale-105 transform"
                                            >
                                                <i className={`fas fa-${isLogin ? 'user-plus' : 'sign-in-alt'} mr-2 md:mr-3 group-hover:animate-bounce`}></i>
                                                {isLogin ? 'Create Account' : 'Sign In Instead'}
                                            </button>
                                            <p className="mt-2 md:mt-4 text-text-muted-cool-gray text-xs md:text-sm">
                                                {isLogin ? "Don't have an account yet?" : "Already have an account?"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Toggle Button */}
                                <div className="lg:hidden p-6 bg-surface-dark-charcoal/50 border-t border-border-subtle-dark/50">
                                    <div className="text-center">
                                        <button
                                            onClick={toggleMode}
                                            className="group w-full px-6 py-3 bg-gradient-to-r from-highlight-warm-gold to-yellow-500 text-bg-deep-navy font-bold rounded-xl hover:shadow-xl hover:shadow-highlight-warm-gold/30 transition-all duration-300 hover:scale-105 transform"
                                        >
                                            <i className={`fas fa-${isLogin ? 'user-plus' : 'sign-in-alt'} mr-2 group-hover:animate-bounce`}></i>
                                            {isLogin ? 'Create Account' : 'Sign In Instead'}
                                        </button>
                                        <p className="mt-2 text-text-muted-cool-gray text-xs">
                                            {isLogin ? "Don't have an account yet?" : "Already have an account?"}
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