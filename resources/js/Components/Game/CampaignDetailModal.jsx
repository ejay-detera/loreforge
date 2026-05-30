import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes, faSkull, faTrophy, faUser,
    faChevronRight, faClock, faHeart, faBolt, faScroll,
    faRotateRight, faPlay, faSpinner, faStar,
    faTrash, faPaperPlane, faComments
} from '@fortawesome/free-solid-svg-icons';
import { getGenreTheme } from '@/Components/Game/GenreContainer';
import { createPortal } from 'react-dom';
import { router, usePage } from '@inertiajs/react';

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ avgRating, ratingsCount, userRating, onRate, accentHex }) {
    const [hovered, setHovered] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleRate = async (star) => {
        if (submitting) return;
        setSubmitting(true);
        await onRate(star);
        setSubmitting(false);
    };

    const displayStar = hovered || userRating || 0;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= displayStar;
                        return (
                            <button
                                key={star}
                                disabled={submitting}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => handleRate(star)}
                                className="transition-all duration-150 disabled:cursor-not-allowed"
                                style={{
                                    transform: hovered === star ? 'scale(1.3)' : 'scale(1)',
                                    filter: filled
                                        ? `drop-shadow(0 0 6px ${accentHex}88)`
                                        : 'none',
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faStar}
                                    style={{
                                        color: filled ? accentHex : 'rgba(255,255,255,0.15)',
                                        fontSize: 18,
                                        transition: 'color 0.15s',
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>

                {submitting && (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white/30 text-sm" />
                )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/40">
                {avgRating != null ? (
                    <>
                        <FontAwesomeIcon icon={faStar} style={{ color: accentHex }} className="text-xs" />
                        <span className="font-bold text-white/60">{avgRating}</span>
                        <span>average · {ratingsCount} {ratingsCount === 1 ? 'rating' : 'ratings'}</span>
                    </>
                ) : (
                    <span>No ratings yet — be the first!</span>
                )}
                {userRating && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                        style={{ background: accentHex + '22', color: accentHex, border: `1px solid ${accentHex}44` }}>
                        Your rating: {userRating}★
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────
function CommentItem({ comment, currentUserId, onDelete, accentHex }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Delete this comment?')) return;
        setDeleting(true);
        await onDelete(comment.id);
        setDeleting(false);
    };

    return (
        <div className="group flex gap-3 py-3 border-b border-white/[0.06] last:border-0">
            <div
                className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-black"
                style={{ background: accentHex + '22', color: accentHex, border: `1px solid ${accentHex}33` }}
            >
                {comment.author?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-white/70">{comment.author}</span>
                    <span className="text-[10px] text-white/25">{comment.created_at}</span>
                </div>
                <p className="text-[13px] text-white/75 leading-relaxed break-words">{comment.body}</p>
            </div>
            {comment.user_id === currentUserId && (
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="opacity-0 group-hover:opacity-100 shrink-0 w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
                >
                    {deleting
                        ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                        : <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                    }
                </button>
            )}
        </div>
    );
}

// ─── Comments Section ─────────────────────────────────────────────────────────
function CommentsSection({ campaignId, accentHex, currentUserId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);
    const textareaRef = useRef(null);

    const fetchComments = async (p = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/community/${campaignId}/comments?page=${p}`);
            if (res.data.success) {
                setComments(res.data.comments);
                setPagination(res.data.pagination);
            }
        } catch (err) {
            console.error('Failed to load comments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments(page);
    }, [campaignId, page]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!body.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await axios.post(`/api/community/${campaignId}/comments`, { body: body.trim() });
            if (res.data.success) {
                setComments(prev => [res.data.comment, ...prev]);
                setBody('');
                textareaRef.current?.focus();
            }
        } catch (err) {
            console.error('Failed to post comment', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await axios.delete(`/api/community/${campaignId}/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Failed to delete comment', err);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Comment List */}
            {loading ? (
                <div className="flex justify-center py-4">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white/20 text-lg" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-[12px] text-white/25 italic text-center py-4">
                    No comments yet. Share your thoughts!
                </p>
            ) : (
                <div className="flex flex-col">
                    {comments.map(c => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            currentUserId={currentUserId}
                            onDelete={handleDelete}
                            accentHex={accentHex}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >Prev</button>
                    <span className="text-[10px] text-white/30 font-bold">{page} / {pagination.last_page}</span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                        disabled={page === pagination.last_page}
                        className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-lg bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 disabled:opacity-30 transition-all"
                    >Next</button>
                </div>
            )}

            {/* Post a comment */}
            {currentUserId ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-2">
                    <textarea
                        ref={textareaRef}
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Leave a comment…"
                        rows={2}
                        maxLength={1000}
                        className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-white/85 placeholder-white/25 focus:outline-none resize-none transition-colors duration-150"
                        style={{ '--tw-ring-color': accentHex }}
                        onFocus={e => e.target.style.borderColor = accentHex + '66'}
                        onBlur={e => e.target.style.borderColor = ''}
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/20">{body.length}/1000</span>
                        <button
                            type="submit"
                            disabled={!body.trim() || submitting}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: accentHex + '22',
                                border: `1px solid ${accentHex}44`,
                                color: accentHex,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = accentHex + '33'}
                            onMouseLeave={e => e.currentTarget.style.background = accentHex + '22'}
                        >
                            {submitting
                                ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                : <FontAwesomeIcon icon={faPaperPlane} />
                            }
                            Post
                        </button>
                    </div>
                </form>
            ) : (
                <p className="text-[12px] text-white/30 italic text-center py-2">
                    Log in to leave a comment or rating.
                </p>
            )}
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const CampaignDetailModal = ({ campaignId, isOpen, onClose }) => {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id ?? null;

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState(null);
    const [error, setError] = useState(null);
    const [activeTurn, setActiveTurn] = useState(0);
    const [activeTab, setActiveTab] = useState('story');

    // Ratings state (live-updated after user rates)
    const [avgRating, setAvgRating] = useState(null);
    const [ratingsCount, setRatingsCount] = useState(0);
    const [userRating, setUserRating] = useState(null);

    // Replay state
    const [showReplayForm, setShowReplayForm] = useState(false);
    const [replayName, setReplayName] = useState('');
    const [startingReplay, setStartingReplay] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && campaignId) {
            fetchCampaign();
            setShowReplayForm(false);
            setActiveTab('story');
        }
        if (!isOpen) {
            setCampaign(null);
            setActiveTurn(0);
            setShowReplayForm(false);
            setAvgRating(null);
            setRatingsCount(0);
            setUserRating(null);
            setActiveTab('story');
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
                const c = response.data.campaign;
                setCampaign(c);
                setAvgRating(c.avg_rating);
                setRatingsCount(c.ratings_count ?? 0);
                setUserRating(c.user_rating ?? null);
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

    const handleRate = async (star) => {
        try {
            const res = await axios.post(`/api/community/${campaignId}/rate`, { rating: star });
            if (res.data.success) {
                setUserRating(res.data.user_rating);
                setAvgRating(res.data.avg_rating);
                setRatingsCount(res.data.ratings_count);
            }
        } catch (err) {
            console.error('Failed to submit rating', err);
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
                                {/* Sidebar — turn list */}
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

                                {/* Main content container: manages layout of Story and Comments */}
                                <div className="flex-1 flex flex-col min-w-0">
                                    
                                    {/* Mobile/Tablet Tab Navigation (hidden on lg screens) */}
                                    <div className="flex border-b border-white/10 lg:hidden shrink-0 bg-white/[0.01]">
                                        <button
                                            onClick={() => setActiveTab('story')}
                                            className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border-b-2 ${activeTab === 'story' ? 'text-[var(--acc)] border-[var(--acc)] bg-white/[0.02]' : 'text-white/40 border-transparent hover:text-white/70'}`}
                                        >
                                            Story Path
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('discussion')}
                                            className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border-b-2 ${activeTab === 'discussion' ? 'text-[var(--acc)] border-[var(--acc)] bg-white/[0.02]' : 'text-white/40 border-transparent hover:text-white/70'}`}
                                        >
                                            Discussion & Rating
                                        </button>
                                    </div>

                                    {/* Sub-container containing both columns */}
                                    <div className="flex-1 flex min-h-0 overflow-hidden">
                                        
                                        {/* Story Narrative Column */}
                                        <div
                                            className={`flex-1 min-w-0 overflow-y-auto custom-scrollbar relative px-1 ${activeTab === 'story' ? 'block' : 'hidden lg:block'}`}
                                            ref={scrollRef}
                                        >
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

                                        {/* Divider (visible on lg screens only) */}
                                        <div className="hidden lg:block w-[1px] bg-white/10 shrink-0 h-full" />

                                        {/* Discussion / Comments & Rating Column */}
                                        <div
                                            className={`w-full lg:w-[380px] shrink-0 overflow-y-auto custom-scrollbar p-5 sm:p-6 bg-[#07090f]/50 ${activeTab === 'discussion' ? 'block' : 'hidden lg:block'}`}
                                        >
                                            <div className="flex flex-col gap-6 max-w-md mx-auto">
                                                {/* Rating */}
                                                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3.5 shadow-md">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                        <FontAwesomeIcon icon={faStar} style={{ color: accentHex }} />
                                                        Rate this Campaign
                                                    </div>
                                                    <StarRating
                                                        avgRating={avgRating}
                                                        ratingsCount={ratingsCount}
                                                        userRating={userRating}
                                                        onRate={handleRate}
                                                        accentHex={accentHex}
                                                    />
                                                </div>

                                                {/* Comments */}
                                                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 flex flex-col gap-3.5 shadow-md">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                                                        <FontAwesomeIcon icon={faComments} style={{ color: accentHex }} />
                                                        Comments
                                                    </div>
                                                    <CommentsSection
                                                        campaignId={campaignId}
                                                        accentHex={accentHex}
                                                        currentUserId={currentUserId}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
