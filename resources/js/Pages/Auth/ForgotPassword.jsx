import { useState } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />
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
                            <Link
                                href={route('login')}
                                className="block px-4 py-2 text-sm font-medium text-text-primary-off-white hover:bg-surface-dark-charcoal rounded-lg transition-colors duration-300"
                            >
                                <i className="fas fa-sign-in-alt mr-2"></i>
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Container */}
                <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-20">
                    <div className="w-full max-w-md">
                        <div className="bg-surface-dark-charcoal/80 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden border border-border-subtle-dark/50 shadow-2xl p-6 sm:p-8 md:p-12">
                            <div className="text-center mb-6 md:mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent-emerald-green to-accent-hover-lighter-green rounded-2xl mb-4 md:mb-6 transform hover:scale-110 transition-transform duration-300">
                                    <i className="fas fa-key text-2xl md:text-3xl text-white"></i>
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary-off-white mb-2 md:mb-3">
                                    Forgot Password
                                </h1>
                                <p className="text-sm md:text-lg text-text-muted-cool-gray px-2">
                                    Enter your email address and we'll send you a link to reset your password
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-accent-emerald-green/20 border border-accent-emerald-green/50 rounded-lg text-sm text-accent-emerald-green">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit}>
                                <div className="space-y-4 md:space-y-6">
                                    <div>
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="w-full"
                                            placeholder="Enter your email address"
                                            isFocused={true}
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <PrimaryButton className="w-full sm:w-auto" disabled={processing}>
                                            <i className="fas fa-paper-plane mr-2"></i>
                                            Send Reset Link
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    href={route('login')}
                                    className="text-sm text-accent-emerald-green hover:text-accent-hover-lighter-green transition-colors duration-300"
                                >
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Back to Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
