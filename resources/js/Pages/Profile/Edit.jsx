import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faKey, faTrash, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import DeleteUserForm from './Partials/DeleteUserForm';
import MfaForm from './Partials/MfaForm';

export default function Edit({ mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState('profile');
    const { auth } = usePage().props;

    const tabs = [
        { id: 'profile', label: 'Profile', icon: faUser },
        { id: 'password', label: 'Password', icon: faKey },
        { id: 'mfa', label: 'MFA', icon: faLock },
        { id: 'danger', label: 'Danger Zone', icon: faTrash },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="min-h-screen" style={{ background: '#080c18' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-xl sm:text-2xl" style={{ color: '#10b981' }} />
                            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#f0ead6' }}>Account Settings</h1>
                        </div>
                        <p className="text-xs sm:text-sm" style={{ color: '#8899aa' }}>
                            Manage your profile, security, and account preferences
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 sm:mb-8 border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-emerald-500 text-emerald-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                                }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} className="text-xs sm:text-sm" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label === 'Profile' ? 'Profile' : tab.label === 'Password' ? 'Pass' : tab.label === 'MFA' ? 'MFA' : 'Danger'}</span>
                            </button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.07)', background: 'rgba(12,16,30,0.8)', backdropFilter: 'blur(8px)' }}>
                            <div className="p-4 sm:p-6 lg:p-8">
                                <UpdateProfileInformationForm 
                                    mustVerifyEmail={mustVerifyEmail} 
                                    status={status} 
                                    className="" 
                                />
                            </div>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.07)', background: 'rgba(12,16,30,0.8)', backdropFilter: 'blur(8px)' }}>
                            <div className="p-4 sm:p-6 lg:p-8">
                                <UpdatePasswordForm className="" />
                            </div>
                        </div>
                    )}

                    {/* MFA Tab */}
                    {activeTab === 'mfa' && (
                        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.07)', background: 'rgba(12,16,30,0.8)', backdropFilter: 'blur(8px)' }}>
                            <div className="p-4 sm:p-6 lg:p-8">
                                <MfaForm className="" />
                            </div>
                        </div>
                    )}

                    {/* Danger Zone Tab */}
                    {activeTab === 'danger' && (
                        <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid rgba(224,85,85,0.3)', background: 'rgba(224,85,85,0.05)', backdropFilter: 'blur(8px)' }}>
                            <div className="p-4 sm:p-6 lg:p-8">
                                <DeleteUserForm className="" />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}