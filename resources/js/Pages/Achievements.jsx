import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faLock } from '@fortawesome/free-solid-svg-icons';

export default function Achievements({ achievements }) {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const progressPct = Math.round((unlockedCount / totalCount) * 100) || 0;

    return (
        <AuthenticatedLayout>
            <Head title="Achievements" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-10 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#f5c842]/10 border border-[#f5c842]/30 mb-4 shadow-[0_0_30px_rgba(245,200,66,0.15)]">
                            <FontAwesomeIcon icon={faTrophy} className="text-4xl text-[#f5c842]" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-wide" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Hall of Trophies
                        </h2>
                        <p className="text-gray-400 text-sm max-w-xl mx-auto">
                            Your glorious deeds etched into eternity. View your accomplishments across all adventures.
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mt-8 max-w-md mx-auto">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-[#a78bfa] uppercase tracking-wider">Progress</span>
                                <span className="text-sm font-bold text-white">{unlockedCount} / {totalCount}</span>
                            </div>
                            <div className="w-full h-2 bg-[#121628] rounded-full overflow-hidden border border-[#a78bfa]/20">
                                <div 
                                    className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-1000 ease-out" 
                                    style={{ width: `${progressPct}%`, boxShadow: '0 0 10px rgba(167,139,250,0.5)' }} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Achievements Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((ach) => (
                            <div 
                                key={ach.id}
                                className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 ${
                                    ach.unlocked 
                                        ? 'bg-[#121628]/80 border-[#f5c842]/40 shadow-[0_4px_20px_rgba(245,200,66,0.08)] hover:-translate-y-1' 
                                        : 'bg-[#080c18] border-white/5 opacity-70 grayscale-[50%]'
                                }`}
                                style={{ backdropFilter: 'blur(12px)' }}
                            >
                                {/* Background glow for unlocked */}
                                {ach.unlocked && (
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f5c842]/5 rounded-full blur-2xl pointer-events-none" />
                                )}

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center border ${
                                        ach.unlocked 
                                            ? 'bg-gradient-to-br from-[#f5c842]/20 to-[#d4920d]/10 border-[#f5c842]/50' 
                                            : 'bg-white/5 border-white/10'
                                    }`}>
                                        <i className={`fas ${ach.unlocked ? ach.icon : 'fa-lock'} text-2xl ${
                                            ach.unlocked ? 'text-[#f5c842]' : 'text-gray-500'
                                        }`} />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className={`text-lg font-bold mb-1 leading-tight ${ach.unlocked ? 'text-white' : 'text-gray-400'}`}>
                                            {ach.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-3 leading-snug">
                                            {ach.description}
                                        </p>
                                        
                                        {/* Game Context Pill */}
                                        {ach.unlocked && ach.game_context ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#a78bfa]/10 border border-[#a78bfa]/20">
                                                <i className="fas fa-scroll text-[10px] text-[#a78bfa]" />
                                                <span className="text-[10px] font-medium text-[#c4b5fd] truncate max-w-[150px]" title={ach.game_context}>
                                                    {ach.game_context}
                                                </span>
                                            </div>
                                        ) : ach.unlocked ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    Unlocked on {ach.unlocked_at}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="inline-block px-2.5 py-1 rounded-md bg-black/40 border border-white/5">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Locked</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
