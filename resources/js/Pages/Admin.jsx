import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faGamepad, faShareNodes } from '@fortawesome/free-solid-svg-icons';

export default function Admin({ stats, recentUsers }) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Admin Overview</h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#121628] rounded-xl p-6 border border-[#a78bfa]/20 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                                <FontAwesomeIcon icon={faUsers} size="lg" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold text-white">{stats.users}</p>
                            </div>
                        </div>
                        <div className="bg-[#121628] rounded-xl p-6 border border-[#a78bfa]/20 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#f5c842]/10 flex items-center justify-center text-[#f5c842]">
                                <FontAwesomeIcon icon={faGamepad} size="lg" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Total Sessions</p>
                                <p className="text-2xl font-bold text-white">{stats.sessions}</p>
                            </div>
                        </div>
                        <div className="bg-[#121628] rounded-xl p-6 border border-[#a78bfa]/20 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
                                <FontAwesomeIcon icon={faShareNodes} size="lg" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Shared Campaigns</p>
                                <p className="text-2xl font-bold text-white">{stats.shared}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Users Table */}
                    <div className="bg-[#121628] rounded-xl border border-[#a78bfa]/20 overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#a78bfa]/10">
                            <h3 className="text-lg font-semibold text-white">Recent Users</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-300">
                                <thead className="text-xs uppercase bg-[#0c101e] text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Username</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Joined</th>
                                        <th className="px-6 py-3">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-700/50 hover:bg-[#0c101e]/50">
                                            <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                {user.is_admin ? (
                                                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">Admin</span>
                                                ) : (
                                                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold">User</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {recentUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
