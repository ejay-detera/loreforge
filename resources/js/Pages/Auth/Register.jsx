import { Head, Link } from '@inertiajs/react';

export default function Register() {
    return (
        <>
            <Head title="Redirecting..." />
            <div className="min-h-screen bg-bg-deep-navy flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-emerald-green to-accent-hover-lighter-green rounded-2xl mb-4 animate-spin">
                        <i className="fas fa-dragon text-2xl text-white"></i>
                    </div>
                    <p className="text-text-muted-cool-gray">Redirecting to sign up...</p>
                </div>
            </div>
        </>
    );
}
