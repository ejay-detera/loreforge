import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faToggleOn, faToggleOff, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@inertiajs/react';

export default function MfaForm({ className = '' }) {
    const { auth, flash } = usePage().props;
    const [showDisableConfirm, setShowDisableConfirm] = useState(false);
    
    const user = auth.user;
    const isMfaEnabled = user.two_factor_enabled;

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const enableMfa = () => {
        window.location.href = route('mfa.setup');
    };

    const confirmDisable = () => {
        setShowDisableConfirm(true);
    };

    const disableMfa = (e) => {
        e.preventDefault();
        post(route('mfa.disable'), {
            onFinish: () => {
                setShowDisableConfirm(false);
                reset();
            },
        });
    };

    const cancelDisable = () => {
        setShowDisableConfirm(false);
        reset();
    };

    return (
        <section className={className}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            `}</style>

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <FontAwesomeIcon icon={faShieldAlt} className="text-lg sm:text-xl" style={{ color: '#10b981' }} />
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: '#f0ead6', fontFamily: 'Poppins, sans-serif' }}>Multi-Factor Authentication</h2>
            </div>

            <p className="text-sm mb-6" style={{ color: '#8899aa', fontFamily: 'Poppins, sans-serif' }}>
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
            </p>

            {/* Success Message */}
            {flash?.success && (
                <div className="p-3 sm:p-4 rounded-lg mb-6" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <p className="text-xs sm:text-sm" style={{ color: '#10b981', fontFamily: 'Poppins, sans-serif' }}>
                        {flash.success}
                    </p>
                </div>
            )}

            {/* MFA Status */}
            <div className="p-4 sm:p-6 rounded-lg mb-6" style={{ 
                background: isMfaEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(245,200,66,0.1)', 
                border: isMfaEnabled ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,200,66,0.3)' 
            }}>
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FontAwesomeIcon 
                                icon={isMfaEnabled ? faToggleOn : faToggleOff} 
                                className={`text-xl ${isMfaEnabled ? 'text-emerald-500' : 'text-yellow-500'}`} 
                            />
                            <span className="text-sm font-medium" style={{ 
                                color: isMfaEnabled ? '#10b981' : '#f5c842',
                                fontFamily: 'Poppins, sans-serif'
                            }}>
                                {isMfaEnabled ? 'MFA is Enabled' : 'MFA is Disabled'}
                            </span>
                        </div>
                        <p className="text-xs" style={{ color: '#8899aa', fontFamily: 'Poppins, sans-serif' }}>
                            {isMfaEnabled 
                                ? 'Your account is protected with multi-factor authentication.' 
                                : 'Your account is not protected with multi-factor authentication.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {!isMfaEnabled ? (
                <button
                    onClick={enableMfa}
                    className="w-full sm:w-auto px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                        background: '#10b981',
                        color: '#fff',
                        fontFamily: 'Poppins, sans-serif',
                    }}
                >
                    <FontAwesomeIcon icon={faShieldAlt} />
                    Enable Multi-Factor Authentication
                </button>
            ) : (
                <div>
                    {!showDisableConfirm ? (
                        <button
                            onClick={confirmDisable}
                            className="px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                            style={{
                                background: 'rgba(224,85,85,0.1)',
                                color: '#e05555',
                                border: '1px solid rgba(224,85,85,0.3)',
                                fontFamily: 'Poppins, sans-serif',
                            }}
                        >
                            <FontAwesomeIcon icon={faShieldAlt} />
                            Disable Multi-Factor Authentication
                        </button>
                    ) : (
                        <div className="p-4 rounded-lg" style={{ background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.3)' }}>
                            <div className="flex items-start gap-3 mb-4">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mt-1" />
                                <div>
                                    <h4 className="text-sm font-medium mb-1" style={{ color: '#e05555', fontFamily: 'Poppins, sans-serif' }}>
                                        Disable MFA Confirmation
                                    </h4>
                                    <p className="text-xs" style={{ color: '#8899aa', fontFamily: 'Poppins, sans-serif' }}>
                                        Disabling MFA will make your account less secure. Enter your password to confirm.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={disableMfa} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            borderColor: errors.password ? '#e05555' : 'rgba(255,255,255,0.1)',
                                            color: '#f0ead6',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                        placeholder="Enter your password"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-xs" style={{ color: '#e05555', fontFamily: 'Poppins, sans-serif' }}>{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={cancelDisable}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#8899aa',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                                        style={{
                                            background: processing ? 'rgba(224,85,85,0.5)' : '#e05555',
                                            color: '#fff',
                                            fontFamily: 'Poppins, sans-serif',
                                        }}
                                    >
                                        {processing ? 'Disabling...' : 'Disable MFA'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
