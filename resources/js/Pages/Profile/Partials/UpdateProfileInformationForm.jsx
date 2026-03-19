import { useState, useRef, useEffect } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faSave } from '@fortawesome/free-solid-svg-icons';

export default function UpdateProfileInformationForm({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const { auth } = usePage().props;
    const [profilePreview, setProfilePreview] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: auth?.user?.username || '',
        email: auth?.user?.email || '',
        profile_url: '',
    });

    useEffect(() => {
        if (auth?.user?.profile_url) {
            setProfilePreview(`/storage/${auth.user.profile_url}`);
        }
    }, [auth]);

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
                setData('profile_url', file);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('user.profile.update'), {
            forceFormData: true,
            onFinish: () => reset('profile_url'),
        });
    };

    return (
        <section className={className}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            `}</style>

            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <FontAwesomeIcon icon={faUser} className="text-lg sm:text-xl" style={{ color: '#10b981' }} />
                <h2 className="text-lg sm:text-xl font-semibold" style={{ color: '#f0ead6', fontFamily: 'Poppins, sans-serif' }}>Profile Information</h2>
            </div>

            {/* Profile Picture */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-4" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                    Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="relative">
                        <div
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden border-4"
                            style={{
                                borderColor: 'rgba(16,185,129,0.3)',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                            }}
                        >
                            {profilePreview ? (
                                <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                            ) : (
                                <FontAwesomeIcon icon={faUser} className="text-2xl sm:text-3xl" style={{ color: '#fff' }} />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2"
                            style={{ borderColor: 'rgba(16,185,129,0.3)', background: '#10b981' }}
                        >
                            <FontAwesomeIcon icon={faCamera} className="text-xs" style={{ color: '#fff' }} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs sm:text-sm" style={{ color: '#8899aa', fontFamily: 'Poppins, sans-serif' }}>
                            Click the camera icon to upload a new profile picture
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#6b7a99', fontFamily: 'Poppins, sans-serif' }}>
                            Recommended: Square image, at least 200x200px
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                        Username
                    </label>
                    <input
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 rounded-lg border transition-all duration-200 text-sm sm:text-base"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: errors.username ? '#e05555' : 'rgba(255,255,255,0.1)',
                            color: '#f0ead6',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                        placeholder="Enter your username"
                    />
                    {errors.username && (
                        <p className="mt-1 text-xs" style={{ color: '#e05555', fontFamily: 'Poppins, sans-serif' }}>{errors.username}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#e8e6f0', fontFamily: 'Poppins, sans-serif' }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 rounded-lg border transition-all duration-200 text-sm sm:text-base"
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderColor: errors.email ? '#e05555' : 'rgba(255,255,255,0.1)',
                            color: '#f0ead6',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                        placeholder="Enter your email"
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs" style={{ color: '#e05555', fontFamily: 'Poppins, sans-serif' }}>{errors.email}</p>
                    )}
                </div>

                {mustVerifyEmail && (
                    <div className="p-3 sm:p-4 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <p className="text-xs sm:text-sm" style={{ color: '#10b981', fontFamily: 'Poppins, sans-serif' }}>
                            Your email address is unverified.{' '}
                            <Link href={route('verification.send')} method="post" as="button" className="font-medium underline">
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 text-xs sm:text-sm" style={{ color: '#34d399', fontFamily: 'Poppins, sans-serif' }}>
                                A new verification link has been sent to your email address.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                        style={{
                            background: processing ? 'rgba(16,185,129,0.5)' : '#10b981',
                            color: '#fff',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            fontFamily: 'Poppins, sans-serif',
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} className="text-xs sm:text-sm" />
                        {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </section>
    );
}
