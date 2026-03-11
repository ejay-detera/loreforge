import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
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
        <>
            <Head title="LoreForge" />
            <div className="font-sans antialiased bg-bg-deep-navy text-text-primary-off-white min-h-screen overflow-x-hidden">
                {/* Animated Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-bg-deep-navy via-surface-dark-charcoal to-bg-deep-navy"></div>
                    <div className="absolute inset-0">
                        {[...Array(50)].map((_, i) => (
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
                                {auth.user ? (
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
                                {auth.user ? (
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

                {/* Hero Section */}
                <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="absolute inset-0">
                        <img 
                            src="/images/dungeon-image.webp" 
                            alt="Fantasy landscape" 
                            className="w-full h-full object-cover opacity-40"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-deep-navy/50 to-bg-deep-navy"></div>
                    </div>
                    
                    <div className="relative max-w-7xl mx-auto text-center">
                        <div className="animate-fade-in-up">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                                <span className="bg-gradient-to-r from-accent-emerald-green via-highlight-warm-gold to-accent-emerald-green bg-clip-text text-transparent animate-gradient">
                                    LOREFORGE
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl text-text-primary-off-white/90 max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
                                Choose your destiny in a world of endless adventures where every choice shapes your legend
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                                <button className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-accent-emerald-green to-accent-hover-lighter-green text-white font-semibold rounded-full hover:shadow-xl hover:shadow-accent-emerald-green/30 transition-all duration-300 hover:scale-105 text-sm md:text-base">
                                    <i className="fas fa-play mr-2 group-hover:animate-bounce"></i>
                                    Start Your Journey
                                </button>
                                <button className="px-6 md:px-8 py-3 md:py-4 border-2 border-border-subtle-dark text-text-primary-off-white font-semibold rounded-full hover:border-accent-emerald-green hover:bg-accent-emerald-green/10 transition-all duration-300 hover:scale-105 text-sm md:text-base">
                                    <i className="fas fa-book-open mr-2"></i>
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Genre Selection */}
                <section className="relative z-10 py-16 md:py-24 bg-surface-dark-charcoal/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-off-white mb-4 md:mb-6">
                                CHOOSE YOUR <span className="bg-gradient-to-r from-highlight-warm-gold to-accent-emerald-green bg-clip-text text-transparent">GENRE</span>
                            </h2>
                            <p className="text-base md:text-lg md:text-xl text-text-muted-cool-gray max-w-3xl mx-auto px-4">
                                Select your preferred adventure style and begin your journey through realms of infinite possibility
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {/* Fantasy Card */}
                            <div className="group relative bg-gradient-to-br from-bg-deep-navy to-surface-dark-charcoal border-2 border-highlight-warm-gold/30 rounded-2xl p-6 md:p-8 hover:border-highlight-warm-gold hover:shadow-2xl hover:shadow-highlight-warm-gold/20 transition-all duration-500 hover:scale-105 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-highlight-warm-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10 text-center">
                                    <div className="relative inline-block mb-4 md:mb-6">
                                        <i className="fas fa-hat-wizard text-4xl md:text-5xl text-highlight-warm-gold transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"></i>
                                        <div className="absolute inset-0 bg-highlight-warm-gold/20 rounded-full blur-xl group-hover:opacity-75 transition-opacity duration-500"></div>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-highlight-warm-gold mb-3 md:mb-4 group-hover:text-yellow-400 transition-colors duration-300">
                                        FANTASY
                                    </h3>
                                    <p className="text-text-muted-cool-gray mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                                        Embark on epic quests through enchanted forests, ancient castles, and magical realms filled with mythical creatures and legendary treasures.
                                    </p>
                                    <button className="group/btn w-full px-4 md:px-6 py-3 bg-gradient-to-r from-highlight-warm-gold to-yellow-500 text-bg-deep-navy font-semibold rounded-xl hover:shadow-lg hover:shadow-highlight-warm-gold/30 transition-all duration-300 hover:scale-105 text-sm md:text-base">
                                        <i className="fas fa-dragon mr-2 group-hover/btn:animate-spin"></i>
                                        Explore Fantasy
                                    </button>
                                </div>
                            </div>

                            {/* Horror Card */}
                            <div className="group relative bg-gradient-to-br from-bg-deep-navy to-surface-dark-charcoal border-2 border-horror-accent-blood-red/30 rounded-2xl p-6 md:p-8 hover:border-horror-accent-blood-red hover:shadow-2xl hover:shadow-horror-accent-blood-red/20 transition-all duration-500 hover:scale-105 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-horror-accent-blood-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10 text-center">
                                    <div className="relative inline-block mb-4 md:mb-6">
                                        <i className="fas fa-ghost text-4xl md:text-5xl text-horror-accent-blood-red transform group-hover:scale-110 group-hover:translate-y-[-4px] transition-all duration-500"></i>
                                        <div className="absolute inset-0 bg-horror-accent-blood-red/20 rounded-full blur-xl group-hover:opacity-75 transition-opacity duration-500"></div>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-horror-accent-blood-red mb-3 md:mb-4 group-hover:text-red-600 transition-colors duration-300">
                                        HORROR
                                    </h3>
                                    <p className="text-text-muted-cool-gray mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                                        Face your deepest fears in dark, atmospheric worlds where survival is never guaranteed and terror lurks around every corner.
                                    </p>
                                    <button className="group/btn w-full px-4 md:px-6 py-3 bg-gradient-to-r from-horror-accent-blood-red to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-horror-accent-blood-red/30 transition-all duration-300 hover:scale-105 text-sm md:text-base">
                                        <i className="fas fa-skull mr-2 group-hover/btn:animate-pulse"></i>
                                        Face Your Fears
                                    </button>
                                </div>
                            </div>

                            {/* Sci-Fi Card */}
                            <div className="group relative bg-gradient-to-br from-bg-deep-navy to-surface-dark-charcoal border-2 border-scifi-accent-electric-blue/30 rounded-2xl p-6 md:p-8 hover:border-scifi-accent-electric-blue hover:shadow-2xl hover:shadow-scifi-accent-electric-blue/20 transition-all duration-500 hover:scale-105 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-scifi-accent-electric-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10 text-center">
                                    <div className="relative inline-block mb-4 md:mb-6">
                                        <i className="fas fa-rocket text-4xl md:text-5xl text-scifi-accent-electric-blue transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"></i>
                                        <div className="absolute inset-0 bg-scifi-accent-electric-blue/20 rounded-full blur-xl group-hover:opacity-75 transition-opacity duration-500"></div>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-scifi-accent-electric-blue mb-3 md:mb-4 group-hover:text-blue-400 transition-colors duration-300">
                                        SCI-FI
                                    </h3>
                                    <p className="text-text-muted-cool-gray mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                                        Journey through the cosmos, explore advanced technologies, and discover the mysteries of the universe in futuristic adventures.
                                    </p>
                                    <button className="group/btn w-full px-4 md:px-6 py-3 bg-gradient-to-r from-scifi-accent-electric-blue to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-scifi-accent-electric-blue/30 transition-all duration-300 hover:scale-105 text-sm md:text-base">
                                        <i className="fas fa-satellite mr-2 group-hover/btn:animate-spin"></i>
                                        Launch Adventure
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="relative z-10 py-16 md:py-24 bg-bg-deep-navy/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary-off-white mb-4 md:mb-6">
                                WHY CHOOSE <span className="bg-gradient-to-r from-accent-emerald-green to-scifi-accent-electric-blue bg-clip-text text-transparent">LOREFORGE</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <div className="text-center group">
                                <div className="relative inline-block mb-4 md:mb-6">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent-emerald-green to-accent-hover-lighter-green rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <i className="fas fa-infinity text-2xl md:text-3xl text-white"></i>
                                    </div>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-text-primary-off-white mb-2 md:mb-3">Infinite Worlds</h3>
                                <p className="text-text-muted-cool-gray text-sm md:text-base">Explore limitless procedurally generated realms</p>
                            </div>
                            <div className="text-center group">
                                <div className="relative inline-block mb-4 md:mb-6">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-highlight-warm-gold to-yellow-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <i className="fas fa-users text-2xl md:text-3xl text-white"></i>
                                    </div>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-text-primary-off-white mb-2 md:mb-3">Multiplayer</h3>
                                <p className="text-text-muted-cool-gray text-sm md:text-base">Join forces with adventurers worldwide</p>
                            </div>
                            <div className="text-center group">
                                <div className="relative inline-block mb-4 md:mb-6">
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-scifi-accent-electric-blue to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <i className="fas fa-code text-2xl md:text-3xl text-white"></i>
                                    </div>
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-text-primary-off-white mb-2 md:mb-3">Mod Support</h3>
                                <p className="text-text-muted-cool-gray text-sm md:text-base">Create and share custom content</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 bg-surface-dark-charcoal/80 backdrop-blur-lg border-t border-border-subtle-dark/50 py-8 md:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex items-center group">
                                <div className="relative">
                                    <i className="fas fa-dragon text-lg md:text-xl text-accent-emerald-green mr-2 transform group-hover:scale-110 transition-transform duration-300"></i>
                                    <div className="absolute -inset-1 bg-accent-emerald-green/20 rounded-full blur-sm group-hover:opacity-75 transition-opacity duration-300"></div>
                                </div>
                                <div className="text-lg md:text-xl font-bold text-accent-emerald-green group-hover:text-accent-hover-lighter-green transition-colors duration-300">
                                    LOREFORGE
                                </div>
                            </div>
                            
                            <div className="text-text-muted-cool-gray text-xs md:text-sm text-center">
                                © 2025 LoreForge. All rights reserved.
                            </div>
                            
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
                                <a href="#" className="text-text-muted-cool-gray hover:text-accent-emerald-green text-xs md:text-sm transition-colors duration-300 hover:scale-105 inline-block text-center">
                                    <i className="fas fa-shield-alt mr-1"></i>
                                    Privacy Policy
                                </a>
                                <a href="#" className="text-text-muted-cool-gray hover:text-accent-emerald-green text-xs md:text-sm transition-colors duration-300 hover:scale-105 inline-block text-center">
                                    <i className="fas fa-file-contract mr-1"></i>
                                    Terms of Service
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
