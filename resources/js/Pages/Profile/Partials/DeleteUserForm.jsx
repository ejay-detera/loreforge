import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <div className={className}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            `}</style>

            <div className="flex items-center gap-4 mb-6">
                <FontAwesomeIcon icon={faTrash} className="text-xl" style={{ color: '#e05555' }} />
                <h2 className="text-xl font-semibold" style={{ color: '#f0ead6', fontFamily: 'Poppins, sans-serif' }}>Delete Account</h2>
            </div>

            <p className="text-sm mb-6" style={{ color: '#8899aa', fontFamily: 'Poppins, sans-serif' }}>
                Once your account is deleted, all of its resources and data will be permanently deleted. 
                Before deleting your account, please download any data or information that you wish to retain.
            </p>

            <button
                onClick={confirmUserDeletion}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                    background: '#e05555',
                    color: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                }}
            >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete Account
            </button>

            {/* Confirmation Modal */}
            {confirmingUserDeletion && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div 
                            className="fixed inset-0 transition-opacity" 
                            onClick={closeModal}
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
                        />

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                             style={{ background: 'rgba(12,16,30,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            
                            <div className="px-6 pt-5 pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" style={{ color: '#f5c842' }} />
                                        <h3 className="text-lg font-semibold" style={{ color: '#f0ead6', fontFamily: 'Poppins, sans-serif' }}>
                                            Delete Account
                                        </h3>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="text-gray-400 hover:text-gray-300 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>

                                <p className="text-sm mb-4" style={{ color: '#8899aa', fontFamily: 'Poppins, sans-serif' }}>
                                    Once your account is deleted, all of its resources and data will be permanently deleted. 
                                    Please enter your password to confirm you would like to permanently delete your account.
                                </p>

                                <form onSubmit={deleteUser}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            ref={passwordInput}
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
                                            autoFocus
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-xs" style={{ color: '#e05555' }}>{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
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
                                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                            {processing ? 'Deleting...' : 'Delete Account'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
