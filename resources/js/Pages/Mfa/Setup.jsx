import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faShieldAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';

export default function MfaSetup({ qrCodeUrl, secret }) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mfa.enable'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Setup Multi-Factor Authentication" />

            <div className="min-h-screen" style={{ background: '#080c18' }}>
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Header */}
                    <div className="mb-8">
                        <Link 
                            href="/user-profile" 
                            className="inline-flex items-center gap-2 text-sm mb-4 hover:text-emerald-400 transition-colors"
                            style={{ color: '#8899aa' }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                            Back to Profile
                        </Link>
                        
                        <div className="flex items-center gap-3 mb-2">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" style={{ color: '#10b981' }} />
                            <h1 className="text-3xl font-bold" style={{ color: '#f0ead6' }}>Setup Multi-Factor Authentication</h1>
                        </div>
                        <p className="text-sm" style={{ color: '#8899aa' }}>
                            Add an extra layer of security to your account with 2FA
                        </p>
                    </div>

                    <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.07)', background: 'rgba(12,16,30,0.8)', backdropFilter: 'blur(8px)' }}>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(16,185,129,0.1)' }}>
                                    <FontAwesomeIcon icon={faQrcode} className="text-2xl" style={{ color: '#10b981' }} />
                                </div>
                                <h2 className="text-xl font-semibold mb-2" style={{ color: '#f0ead6' }}>Scan QR Code</h2>
                                <p className="text-sm" style={{ color: '#8899aa' }}>
                                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-8">
                                <div className="bg-white p-4 rounded-lg">
                                    <img 
                                        src={qrCodeUrl} 
                                        alt="MFA QR Code" 
                                        className="w-48 h-48"
                                        onError={(e) => {
                                            console.error('QR Code failed to load:', e);
                                            e.target.style.display = 'none';
                                        }}
                                        onLoad={() => {
                                            // QR Code loaded successfully
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Secret Key */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0' }}>
                                    Or enter this secret key manually:
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={secret}
                                        readOnly
                                        className="flex-1 px-4 py-3 rounded-lg border bg-gray-900 text-gray-300 font-mono text-sm"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderColor: 'rgba(255,255,255,0.1)',
                                            color: '#f0ead6',
                                        }}
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(secret)}
                                        className="px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
                                        style={{
                                            background: 'rgba(16,185,129,0.1)',
                                            color: '#10b981',
                                            border: '1px solid rgba(16,185,129,0.3)',
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {/* Verification Form */}
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0' }}>
                                        Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border transition-all duration-200 text-center text-lg font-mono"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderColor: errors.code ? '#e05555' : 'rgba(255,255,255,0.1)',
                                            color: '#f0ead6',
                                        }}
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus
                                    />
                                    {errors.code && (
                                        <p className="mt-1 text-xs" style={{ color: '#e05555' }}>{errors.code}</p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                                        style={{
                                            background: processing ? 'rgba(16,185,129,0.5)' : '#10b981',
                                            color: '#fff',
                                            cursor: processing ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faShieldAlt} />
                                        {processing ? 'Enabling...' : 'Enable MFA'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
