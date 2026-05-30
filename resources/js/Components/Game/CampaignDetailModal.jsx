import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes, faSkull, faTrophy, faUser,
    faChevronRight, faClock, faHeart, faBolt, faScroll,
    faRotateRight, faPlay, faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { getGenreTheme } from '@/Components/Game/GenreContainer';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';

const CampaignDetailModal = ({ campaignId, isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [error, setError] = useState(null);
    const [activeTurn, setActiveTurn] = useState(0);
    
    // Replay state
    const [showReplayForm, setShowReplayForm] = useState(false);
    const [replayName, setReplayName] = useState('');
    const [startingReplay, setStartingReplay] = useState(false);
    
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && campaignId) {
            fetchCampaign();
            setShowReplayForm(false);
        }
        if (!isOpen) { 
            setCampaign(null); 
            setActiveTurn(0); 
            setShowReplayForm(false);
        }
    }, [isOpen, campaignId]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const fetchCampaign = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/community/${campaignId}`);
            if (response.data.success) {
                setCampaign(response.data.campaign);
            } else {
                setError('Failed to load campaign details.');
            }
        } catch (err) {
            console.error('Error fetching campaign details:', err);
            setError('An error occurred while fetching details.');
        } finally {
            setLoading(false);
        }
    };

    const handleReplay = async (e) => {
        e.preventDefault();
        if (!campaign) return;

        setStartingReplay(true);
        try {
            const response = await axios.post(`/api/community/${campaignId}/replay`, {
                character_name: replayName
            });

            if (response.data.success) {
                // Navigate to game screen
                router.visit('/game');
            }
        } catch (err) {
            console.error('Failed to start replay:', err);
            alert(err.response?.data?.message || 'Failed to start replay.');
            setStartingReplay(false);
        }
    };

    if (!isOpen) return null;

    const theme = campaign ? getGenreTheme(campaign.genre.toLowerCase()) : getGenreTheme('fantasy');
    const accentHex = campaign ? theme.accentColor : '#60a5fa';
    const isVictory = campaign?.outcome === 'victory';
    const isDefeat = campaign?.outcome === 'defeat';
    const outcomeColor = isVictory ? '#4ade80' : isDefeat ? '#f87171' : '#94a3b8';
    const outcomeIcon = isVictory ? faTrophy : isDefeat ? faSkull : faClock;
    const outcomeLabel = isVictory ? 'Victory Achieved' : isDefeat ? 'Journey Ended' : 'Adventure Abandoned';

    const turns = campaign?.turns ?? [];
    const currentTurn = turns[activeTurn];

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-stretch justify-stretch bg-[#0D1117] backdrop-blur-xl animate-[co-fade_0.25s_ease_both] pointer-events-auto"
            aria-modal="true"
            role="dialog"
        >
            <style>{`
                @keyframes co-fade { from { opacity:0 } to { opacity:1 } }
                @keyframes co-up { from { transform: translateY(24px); opacity:0 } to { transform:none; opacity:1 } }

                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--acc-20);
                    border-radius: 10px;
                    transition: background 0.2s;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--acc-40); }
                ::selection { background: var(--acc-30); color: #fff; }
            `}</style>

            <div
                className="flex flex-col w-full h-full max-w-[1200px] mx-auto p-2 sm:p-4 box-border animate-[co-up_0.3s_cubic-bezier(0.22,1,0.36,1)_both]"
                style={{
                    '--acc': accentHex,
                    '--acc-10': accentHex + '1a',
                    '--acc-20': accentHex + '33',
                    '--acc-30': accentHex + '4d',
                    '--acc-40': accentHex + '66',
                }}
            >
                <div className="flex flex-col flex-1 bg-[#080a12]/96 rounded-[20px] overflow-hidden border border-[var(--acc-20)] shadow-[0_0_60px_-10px_var(--acc-30),0_40px_80px_-20px_#000] min-h-0">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-[18px] border-b border-white/10 bg-white/[0.02] shrink-0">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[16px] bg-[var(--acc-10)] text-[var(--acc)] border border-[var(--acc-20)]">
                                <FontAwesomeIcon icon={faScroll} />
                            </div>
                            <div>
                                <div className="text-[18px] font-black text-white tracking-wider leading-[1.1]">Community Campaign</div>
                                {campaign && (
                                    <div className="text-[10px] text-white/35 uppercase tracking-[0.15em] mt-0.5">
                                        {campaign.character_name} · {campaign.genre} Adventure · By {campaign.author}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    {campaign && (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-white/10 shrink-0 bg-black/30">
                            <div className="bg-white/[0.03] border border-white/10 rounded-[10px] p-3 flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">Outcome</span>
                                <span className="text-sm font-bold truncate" style={{ color: outcomeColor }}>
                                    {(campaign.outcome || 'Abandoned').toUpperCase()}
                                </span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/10 rounded-[10px] p-3 flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">Turns</span>
                                <span className="text-sm font-bold text-white">{campaign.turn_count} / {campaign.max_turns}</span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/10 rounded-[10px] p-3 flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">Health</span>
                                <span className="text-sm font-bold text-[#4ade80]">
                                    {campaign.current_health} HP
                                </span>
                            </div>
                            <div className="bg-white/[0.03] border border-white/10 rounded-[10px] p-3 flex flex-col gap-1">
                                <span className="text-[9px] uppercase tracking-[0.15em] text-white/30">Mana</span>
                                <span className="text-sm font-bold text-[#60a5fa]">
                                    {campaign.current_mana} MP
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/40 text-[12px] uppercase tracking-[0.15em]">
                                <div className="w-10 h-10 border-3 border-white/10 border-t-[var(--acc)] rounded-full animate-spin" />
                                <span>Loading Campaign…</span>
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/40 text-[12px] uppercase tracking-[0.15em]">
                                <FontAwesomeIcon icon={faSkull} className="text-3xl text-red-400" />
                                <span className="text-red-400">{error}</span>
                                <button
                                    className="px-5 py-2.5 rounded-[10px] text-[11px] uppercase tracking-[0.15em] bg-white/[0.06] border border-white/[0.12] text-white/70 hover:bg-white/[0.12] hover:text-white flex items-center gap-2"
                                    onClick={fetchCampaign}
                                >
                                    <FontAwesomeIcon icon={faRotateRight} /> Try Again
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Sidebar */}
                                <div className="w-[220px] shrink-0 border-r border-white/10 overflow-y-auto px-2 py-3 hidden sm:flex flex-col gap-1 custom-scrollbar">
                                    {turns.length > 0 ? turns.map((turn, idx) => (
                                        <button
                                            key={turn.id}
                                            className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer transition-all duration-150 border border-transparent hover:bg-white/[0.04] ${idx === activeTurn ? 'bg-[var(--acc-10)] border-[var(--acc-20)]' : ''}`}
                                            onClick={() => { setActiveTurn(idx); scrollRef.current?.scrollTo(0, 0); }}
                                        >
                                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-150 ${idx === activeTurn ? 'bg-[var(--acc)] text-black' : 'bg-white/[0.08] text-white/50 group-hover:bg-white/20'}`}>
                                                {turn.turn_number}
                                            </span>
                                            <span className={`text-[11px] leading-[1.3] overflow-hidden line-clamp-2 text-left transition-colors duration-150 ${idx === activeTurn ? 'text-white/85' : 'text-white/45'}`}>
                                                {turn.story_text?.slice(0, 60) ?? 'Turn ' + turn.turn_number}
                                            </span>
                                        </button>
                                    )) : (
                                        <div className="p-5 text-[11px] text-white/20">No turns recorded.</div>
                                    )}
                                </div>

                                {/* Main turn reader */}
                                <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar relative px-1" ref={scrollRef}>
                                    {turns.length > 0 && currentTurn ? (
                                        <div className="p-4 sm:p-7 flex flex-col gap-5 max-w-3xl mx-auto">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                                                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[13px] font-black bg-[var(--acc)] text-black shrink-0">
                                                    {currentTurn.turn_number}
                                                </div>
                                                <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--acc)] font-bold">Turn {currentTurn.turn_number} of {turns.length}</div>
                                            </div>

                                            <div className="bg-white/[0.03] border border-white/10 border-l-[3px] border-l-[var(--acc-40)] rounded-xl p-5 text-sm leading-[1.85] text-white/90">
                                                {currentTurn.story_text}
                                            </div>

                                            {currentTurn.player_choice && (
                                                <div className="bg-amber-400/[0.04] border border-amber-400/[0.12] rounded-xl p-4 sm:p-5 flex flex-col gap-2.5">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">
                                                        <FontAwesomeIcon icon={faChevronRight} className="text-[8px]" />
                                                        Player Choice
                                                    </div>
                                                    <div className="text-[13px] text-white/90">{currentTurn.player_choice}</div>
                                                    {currentTurn.outcomes?.[currentTurn.player_choice]?.story && (
                                                        <div className="text-[12px] text-white/40 italic pt-2 border-t border-white/[0.06]">
                                                            {currentTurn.outcomes[currentTurn.player_choice].story.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTurn === turns.length - 1 && (
                                                <div
                                                    className="rounded-2xl p-7 text-center flex flex-col items-center gap-2 animate-[co-fade_0.4s_ease_both_0.1s]"
                                                    style={{
                                                        borderColor: outcomeColor + '44',
                                                        background: outcomeColor + '0d',
                                                        borderWidth: '1px'
                                                    }}
                                                >
                                                    <div className="text-[36px] mb-1" style={{ color: outcomeColor }}>
                                                        <FontAwesomeIcon icon={outcomeIcon} />
                                                    </div>
                                                    <div className="text-[22px] font-black tracking-[0.08em] text-white">{outcomeLabel}</div>
                                                    <div className="text-xs text-white/40">
                                                        {campaign.character_name}'s legend concluded at turn {campaign.turn_count}.
                                                    </div>
                                                </div>
                                            )}

                                            {/* Navigation */}
                                            <div className="flex items-center gap-2 pt-2">
                                                <button
                                                    className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer transition-all duration-150 bg-white/[0.05] border border-white/10 text-white/60 hover:not-disabled:bg-white/10 hover:not-disabled:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                    disabled={activeTurn === 0}
                                                    onClick={() => { setActiveTurn(p => p - 1); scrollRef.current?.scrollTo(0, 0); }}
                                                >
                                                    ← Prev
                                                </button>
                                                <span className="mx-auto text-[11px] text-white/30 font-bold">{activeTurn + 1} / {turns.length}</span>
                                                <button
                                                    className={`px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.15em] cursor-pointer transition-all duration-150 ${activeTurn < turns.length - 1 ? 'bg-[var(--acc-20)] border-[var(--acc-40)] text-[var(--acc)] hover:not-disabled:bg-[var(--acc-30)]' : 'bg-white/[0.05] border border-white/10 text-white/60 disabled:opacity-30 disabled:cursor-not-allowed'}`}
                                                    disabled={activeTurn === turns.length - 1}
                                                    onClick={() => { setActiveTurn(p => p + 1); scrollRef.current?.scrollTo(0, 0); }}
                                                >
                                                    Next →
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 opacity-30 italic text-sm">
                                            No path was recorded for this journey…
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer / Replay Form */}
                    {showReplayForm ? (
                        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-white/10 flex justify-between items-center bg-black/30 shrink-0">
                            <form onSubmit={handleReplay} className="flex flex-wrap flex-1 items-center gap-2 sm:gap-3">
                                <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest hidden sm:block">Character Name:</span>
                                <input
                                    type="text"
                                    value={replayName}
                                    onChange={(e) => setReplayName(e.target.value)}
                                    placeholder="Enter name"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--acc)] flex-1 min-w-[120px] max-w-[250px]"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={startingReplay}
                                    className="px-[16px] py-[8px] sm:px-[22px] sm:py-[9px] rounded-[10px] text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-200 bg-[var(--acc-20)] border border-[var(--acc-40)] text-[var(--acc)] hover:bg-[var(--acc-30)] disabled:opacity-50 flex items-center gap-2"
                                >
                                    {startingReplay ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faPlay} />}
                                    Replay
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReplayForm(false)}
                                    className="px-3 py-[8px] rounded-[10px] text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-white/10 flex flex-wrap gap-2.5 justify-between items-center bg-black/30 shrink-0">
                            <div>
                                {campaign && (
                                    <button
                                        onClick={() => setShowReplayForm(true)}
                                        className="px-[14px] py-[8px] sm:px-[18px] sm:py-[9px] rounded-[10px] text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-200 bg-[var(--acc-20)] border border-[var(--acc-40)] text-[var(--acc)] hover:bg-[var(--acc-30)] flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faPlay} />
                                        Replay Campaign
                                    </button>
                                )}
                            </div>
                            <button
                                className="px-[16px] py-[8px] sm:px-[22px] sm:py-[9px] rounded-[10px] text-[10px] sm:text-[11px] uppercase tracking-[0.15em] cursor-pointer transition-all duration-150 bg-white/[0.06] border border-white/[0.12] text-white/70 hover:bg-white/[0.12] hover:text-white font-bold"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CampaignDetailModal;
