import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, auth }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="font-sans antialiased bg-bg-deep-navy text-text-primary-off-white min-h-screen overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-bg-deep-navy via-surface-dark-charcoal to-bg-deep-navy"></div>
                <div className="absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-accent-emerald-green rounded-full opacity-0 animate-bubble"
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

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled 
                    ? 'bg-surface-dark-charcoal/95 backdrop-blur-lg border-b border-border-subtle-dark/50 shadow-lg' 
                    : 'bg-transparent'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center group">
                            <div className="relative">
                                <i className="fas fa-dragon text-2xl text-accent-emerald-green mr-2 transform group-hover:scale-110 transition-transform duration-300"></i>
                                <div className="absolute -inset-1 bg-accent-emerald-green/20 rounded-full blur-sm group-hover:opacity-75 transition-opacity duration-300"></div>
                            </div>
                            <div className="text-2xl font-bold text-accent-emerald-green group-hover:text-accent-hover-lighter-green transition-colors duration-300">
                                LOREFORGE
                            </div>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-4">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className={`px-6 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                        isScrolled
                                            ? 'text-text-primary-off-white border border-border-subtle-dark rounded-full hover:border-accent-emerald-green hover:bg-accent-emerald-green/10'
                                            : 'text-text-primary-off-white/90 border border-border-subtle-dark/50 rounded-full hover:border-accent-emerald-green hover:bg-accent-emerald-green/10'
                                    }`}
                                >
                                    <i className="fas fa-crown mr-2"></i>
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('register')}
                                        className={`px-6 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                            isScrolled
                                                ? 'text-text-primary-off-white border border-border-subtle-dark rounded-full hover:border-accent-emerald-green hover:bg-accent-emerald-green/10'
                                                : 'text-text-primary-off-white/90 border border-border-subtle-dark/50 rounded-full hover:border-accent-emerald-green hover:bg-accent-emerald-green/10'
                                        }`}
                                    >
                                        <i className="fas fa-user-plus mr-2"></i>
                                        Register
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-accent-emerald-green to-accent-hover-lighter-green text-white rounded-full hover:shadow-lg hover:shadow-accent-emerald-green/25 transition-all duration-300 hover:scale-105"
                                    >
                                        <i className="fas fa-sign-in-alt mr-2"></i>
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className={`p-2 rounded-lg transition-colors duration-300 ${
                                    isScrolled
                                        ? 'text-text-primary-off-white hover:bg-surface-dark-charcoal'
                                        : 'text-text-primary-off-white/90 hover:bg-surface-dark-charcoal/50'
                                }`}
                            >
                                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="py-4 space-y-2">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                                        isScrolled
                                            ? 'text-text-primary-off-white hover:bg-surface-dark-charcoal'
                                            : 'text-text-primary-off-white/90 hover:bg-surface-dark-charcoal/50'
                                    }`}
                                >
                                    <i className="fas fa-crown mr-2"></i>
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('register')}
                                        className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                                            isScrolled
                                                ? 'text-text-primary-off-white hover:bg-surface-dark-charcoal'
                                                : 'text-text-primary-off-white/90 hover:bg-surface-dark-charcoal/50'
                                        }`}
                                    >
                                        <i className="fas fa-user-plus mr-2"></i>
                                        Register
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="block px-4 py-2 text-sm font-medium bg-gradient-to-r from-accent-emerald-green to-accent-hover-lighter-green text-white rounded-lg hover:shadow-lg hover:shadow-accent-emerald-green/25 transition-all duration-300"
                                    >
                                        <i className="fas fa-sign-in-alt mr-2"></i>
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
