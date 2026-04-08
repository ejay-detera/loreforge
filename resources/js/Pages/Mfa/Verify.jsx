import { Head, useForm, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faKey, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

export default function MfaVerify() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mfa.check'));
    };

    useEffect(() => {
        // Classic approach: immediately move forward
        window.history.forward();
        
        // Replace the current history entry to prevent going back to login
        window.history.replaceState(null, '', window.location.href);
        
        // Then push a new state to create a "trap"
        window.history.pushState(null, '', window.location.href);
        
        const preventBack = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            // Classic approach: always move forward
            window.history.forward();
            
            // Force replace the history to remove any possibility of going back
            window.history.replaceState(null, '', window.location.href);
            window.history.pushState(null, '', window.location.href);
        };

        // Classic noBack function
        const noBack = () => {
            window.history.forward();
        };

        // Add multiple event listeners for maximum coverage
        window.addEventListener('popstate', preventBack, true);
        window.addEventListener('beforeunload', preventBack, true);
        
        // Classic page show handler
        const handlePageShow = (e) => {
            if (e.persisted) {
                noBack();
            }
        };
        window.addEventListener('pageshow', handlePageShow, true);
        
        // Also prevent page navigation via keyboard
        const handleKeyDown = (e) => {
            if ((e.key === 'Backspace' && !['input', 'textarea'].includes(e.target.tagName.toLowerCase())) || 
                (e.altKey && e.key === 'ArrowLeft') ||
                (e.key === 'F5') ||
                (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                noBack(); // Use classic approach
                return false;
            }
        };
        
        window.addEventListener('keydown', handleKeyDown, true);
        
        // Prevent context menu which could allow navigation
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };
        
        window.addEventListener('contextmenu', handleContextMenu, true);

        // Set up interval to continuously enforce forward navigation
        const intervalId = setInterval(() => {
            noBack();
        }, 100);

        // Cleanup
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('popstate', preventBack, true);
            window.removeEventListener('beforeunload', preventBack, true);
            window.removeEventListener('pageshow', handlePageShow, true);
            window.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('contextmenu', handleContextMenu, true);
        };
    }, []);

    const handleLogout = () => {
        router.post(route('mfa.logout'));
    };

    return (
        <>
            <Head title="Verify Multi-Factor Authentication" />
            
            {/* Classic back button prevention script */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    window.history.forward();
                    function noBack() {
                        window.history.forward();
                    }
                `
            }} />
            
            <div 
                className="min-h-screen flex items-center justify-center" 
                style={{ background: '#080c18' }}
            >
                <div className="max-w-md w-full mx-4">
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.07)', background: 'rgba(12,16,30,0.8)', backdropFilter: 'blur(8px)' }}>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(16,185,129,0.1)' }}>
                                    <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" style={{ color: '#10b981' }} />
                                </div>
                                <h1 className="text-2xl font-bold mb-2" style={{ color: '#f0ead6' }}>Enter Verification Code</h1>
                                <p className="text-sm" style={{ color: '#8899aa' }}>
                                    Open your authenticator app and enter the 6-digit code
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0' }}>
                                        Authentication Code
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

                                <div className="flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#8899aa',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Logout
                                    </button>
                                    
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
                                        <FontAwesomeIcon icon={faKey} />
                                        {processing ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
