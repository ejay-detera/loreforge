import { useState, useRef } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(status === 'otp-sent');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    const { post, processing, setData, errors } = useForm();

    const handleOtpChange = (index, value) => {
        // Only allow single digit
        const digit = value.replace(/\D/g, '').slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);
        setData('otp', newDigits.join(''));

        // Auto-advance to next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otpDigits[index]) {
                const newDigits = [...otpDigits];
                newDigits[index] = '';
                setOtpDigits(newDigits);
                setData('otp', newDigits.join(''));
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newDigits = [...otpDigits];
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setOtpDigits(newDigits);
        setData('otp', newDigits.join(''));
        // Focus the next empty box or the last one
        const nextEmpty = newDigits.findIndex(d => d === '');
        inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => setShowOtpInput(true),
        });
    };

    const verifyOtp = (e) => {
        e.preventDefault();
        post(route('verification.verify'), {
            onSuccess: () => {
                window.location.href = route('dashboard');
            },
        });
    };

    return (
        <>
            <Head title="Email Verification" />
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
                                    animationDuration: `${3 + Math.random() * 4}s`,
                                }}
                            >
                                <div className="w-1 h-1 bg-accent-emerald-green rounded-full opacity-30"></div>
                            </div>
                        ))}
                    </div>
                </div>

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
                    <div className="w-full max-w-md">
                        <div className="bg-surface-dark-charcoal/80 backdrop-blur-lg rounded-2xl md:rounded-3xl overflow-hidden border border-border-subtle-dark/50 shadow-2xl p-6 sm:p-8 md:p-12">

                            {/* Header */}
                            <div className="text-center mb-6 md:mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-accent-emerald-green to-accent-hover-lighter-green rounded-2xl mb-4 md:mb-6 transform hover:scale-110 transition-transform duration-300">
                                    <i className="fas fa-envelope-open-text text-2xl md:text-3xl text-white"></i>
                                </div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary-off-white mb-2 md:mb-3">
                                    Verify Your Account
                                </h1>
                                <p className="text-sm md:text-base text-text-muted-cool-gray px-2">
                                    {showOtpInput
                                        ? "Enter the 6-digit code sent to your email address"
                                        : "Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?"}
                                </p>
                            </div>

                            {/* Status banners */}
                            {status === 'verification-link-sent' && (
                                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-accent-emerald-green/20 border border-accent-emerald-green/50 rounded-lg text-sm text-accent-emerald-green">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                            {status === 'otp-sent' && (
                                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-accent-emerald-green/20 border border-accent-emerald-green/50 rounded-lg text-sm text-accent-emerald-green">
                                    A 6-digit verification code has been sent to your email. Check your inbox.
                                </div>
                            )}

                            {/* Form */}
                            {!showOtpInput ? (
                                <form onSubmit={submit}>
                                    <div className="flex items-center justify-center">
                                        <PrimaryButton disabled={processing}>
                                            <i className="fas fa-paper-plane mr-2"></i>
                                            Send OTP Code
                                        </PrimaryButton>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={verifyOtp}>
                                    <div className="space-y-6">

                                        {/* OTP Digit Boxes */}
                                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                                            {otpDigits.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => (inputRefs.current[index] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    autoFocus={index === 0}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                                    onPaste={handlePaste}
                                                    className={`
                                                        w-11 h-14 sm:w-13 sm:h-16 md:w-14 md:h-[72px]
                                                        text-center text-2xl sm:text-3xl font-bold
                                                        rounded-xl border-2 outline-none
                                                        bg-bg-deep-navy
                                                        transition-all duration-200
                                                        caret-accent-emerald-green
                                                        ${digit
                                                            ? 'border-accent-emerald-green text-accent-emerald-green shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                                                            : 'border-border-subtle-dark/60 text-text-primary-off-white focus:border-accent-emerald-green/70 focus:shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                                                        }
                                                    `}
                                                    style={{ width: '3rem', height: '3.75rem' }}
                                                />
                                            ))}
                                        </div>

                                        {errors.otp && (
                                            <p className="text-center text-sm text-red-500">{errors.otp}</p>
                                        )}

                                        <div className="flex items-center justify-center">
                                            <PrimaryButton
                                                className="w-full sm:w-auto"
                                                disabled={processing || otpDigits.join('').length < 6}
                                            >
                                                <i className="fas fa-shield-alt mr-2"></i>
                                                Verify OTP Code
                                            </PrimaryButton>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowOtpInput(false);
                                                setOtpDigits(['', '', '', '', '', '']);
                                            }}
                                            className="text-sm text-accent-emerald-green hover:text-accent-hover-lighter-green transition-colors duration-300"
                                        >
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            Back to Email Options
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="mt-6 text-center">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    className="text-sm text-accent-emerald-green hover:text-accent-hover-lighter-green transition-colors duration-300"
                                    as="button"
                                >
                                    <i className="fas fa-sign-out-alt mr-2"></i>
                                    Sign Out
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}