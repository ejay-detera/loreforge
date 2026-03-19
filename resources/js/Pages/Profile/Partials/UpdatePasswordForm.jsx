import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faSave } from '@fortawesome/free-solid-svg-icons';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <div className={className}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            `}</style>

            <div className="flex items-center gap-4 mb-6">
                <FontAwesomeIcon icon={faKey} className="text-xl" style={{ color: '#f5c842' }} />
                <h2 className="text-xl font-semibold" style={{ color: '#f0ead6', fontFamily: 'Poppins, sans-serif' }}>Change Password</h2>
            </div>

            <p className="text-sm mb-6" style={{ color: '#8899aa', fontFamily: 'Poppins, sans-serif' }}>
                Ensure your account is using a long, random password to stay secure.
            </p>

            <form onSubmit={updatePassword} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                        Current Password
                    </label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: errors.current_password ? '#e05555' : 'rgba(255,255,255,0.1)',
                            color: '#f0ead6',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                    />
                    {errors.current_password && (
                        <p className="mt-1 text-xs" style={{ color: '#e05555' }}>{errors.current_password}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                        New Password
                    </label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: errors.password ? '#e05555' : 'rgba(255,255,255,0.1)',
                            color: '#f0ead6',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs" style={{ color: '#e05555' }}>{errors.password}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                        Confirm New Password
                    </label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border transition-all duration-200"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: errors.password_confirmation ? '#e05555' : 'rgba(255,255,255,0.1)',
                            color: '#f0ead6',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                    />
                    {errors.password_confirmation && (
                        <p className="mt-1 text-xs" style={{ color: '#e05555' }}>{errors.password_confirmation}</p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ opacity: recentlySuccessful ? 1 : 0, transition: 'opacity 0.3s' }}>
                        <FontAwesomeIcon icon={faSave} className="text-sm" style={{ color: '#10b981' }} />
                        <span className="text-sm" style={{ color: '#10b981', fontFamily: 'Poppins, sans-serif' }}>
                            Password updated successfully!
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                        style={{
                            background: processing ? 'rgba(16,185,129,0.5)' : '#10b981',
                            color: '#fff',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {processing ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}
